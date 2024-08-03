import { BuildOrderBlock, BuildOrderBlockId, FailureData, MappedValue, Step, StepActionBase } from "./types.js"
import { format_err, gen_map_id, jstr, salt_symbol_from_val } from "./utils.js"
import { create_logger } from "./utils.js"

const log = create_logger("salt", true)

export interface SaltMetadata {
    version: number
}

enum SaltCharType {
    SUPPLY = 0,
    MINUTES,
    SECONDS,
    TYPE,
    ITEM_ID,
}

const enum SaltActionType {
    STRUCTURE = 0,
    UNIT,
    MORPH,
    UPGRADE
}

export class Salt {

    // Version is always the first character of any SALT string
    private readonly VERSION_CHAR_IDX: number = 0
    // End of title section is always denoted with a "~" character
    private readonly SECTION_DELIMITER: string = "~"
    // Supply amount is shifted to the left by (4)
    private readonly SUPPLY_SHIFT: number = 4
    // [Supply][Minutes][Seconds][Type][Item Id]
    private readonly CHUNK_LENGTH: number = 5
    private readonly ERR_CHAR: string = "❗"

    private readonly symbol_map = new Map([
        [" ", 0], ["!", 1], ["\"", 2], ["#", 3], ["$", 4],
        ["%", 5], ["&", 6], ["'", 7], ["(", 8], [")", 9],
        ["*", 10], ["+", 11], [",", 12], ["-", 13], [".", 14],
        ["/", 15], ["0", 16], ["1", 17], ["2", 18], ["3", 19],
        ["4", 20], ["5", 21], ["6", 22], ["7", 23], ["8", 24],
        ["9", 25], [":", 26], [";", 27], ["<", 28], ["=", 29],
        [">", 30], ["?", 31], ["@", 32], ["A", 33], ["B", 34],
        ["C", 35], ["D", 36], ["E", 37], ["F", 38], ["G", 39],
        ["H", 40], ["I", 41], ["J", 42], ["K", 43], ["L", 44],
        ["M", 45], ["N", 46], ["O", 47], ["P", 48], ["Q", 49],
        ["R", 50], ["S", 51], ["T", 52], ["U", 53], ["V", 54],
        ["W", 55], ["X", 56], ["Y", 57], ["Z", 58], ["[", 59],
        ["\\", 60], ["]", 61], ["^", 62], ["_", 63], ["`", 64],
        ["a", 65], ["b", 66], ["c", 67], ["d", 68], ["e", 69],
        ["f", 70], ["g", 71], ["h", 72], ["i", 73], ["j", 74],
        ["k", 75], ["l", 76], ["m", 77], ["n", 78], ["o", 79],
        ["p", 80], ["q", 81], ["r", 82], ["s", 83], ["t", 84],
        ["u", 85], ["v", 86], ["w", 87], ["x", 88], ["y", 89],
        ["z", 90], ["{", 91], ["|", 92], ["}", 93], ["~", 94]
    ])

    private readonly structures = new Map([
        ["00", "Armory"], ["01", "Barracks"],
        ["02", "Bunker"], ["03", "Command Center"],
        ["04", "Engineering Bay"], ["05", "Factory"],
        ["06", "Fusion Core"], ["07", "Ghost Academy"],
        ["08", "Missile Turret"], ["09", "Reactor (Barracks)"],
        ["10", "Reactor (Factory)"], ["11", "Reactor (Starport)"],
        ["12", "Refinery"], ["13", "Sensor Tower"],
        ["14", "Starport"], ["15", "Supply Depot"],
        ["16", "Tech Lab (Barracks)"], ["17", "Tech Lab (Factory)"],
        ["18", "Tech Lab (Starport)"], ["19", "Assimilator"],
        ["20", "Cybernetics Core"], ["21", "Dark Shrine"],
        ["22", "Fleet Beacon"], ["24", "Gateway"],
        ["25", "Nexus"], ["26", "Photon Cannon"],
        ["27", "Pylon"], ["28", "Robotics Bay"],
        ["29", "Robotics Facility"], ["30", "Stargate"],
        ["31", "Templar Archives"], ["32", "Twilight Council"],
        ["33", "Baneling Nest"], ["34", "Evolution Chamber"],
        ["35", "Extractor"], ["36", "Hatchery"],
        ["37", "Hydralisk Den"], ["38", "Infestation Pit"],
        ["39", "Nydus Network"], ["40", "Roach Warren"],
        ["41", "Spawning Pool"], ["42", "Spine Crawler"],
        ["43", "Spire"], ["44", "Spore Crawler"],
        ["45", "Ultralisk Cavern"], ["46", "Creep Tumor"]
    ])

    private readonly units = new Map([
        ["00", "Banshee"], ["01", "Battlecruiser"],
        ["02", "Ghost"], ["03", "Hellion"],
        ["04", "Marauder"], ["05", "Marine"],
        ["06", "Medivac"], ["07", "Raven"],
        ["08", "Reaper"], ["09", "SCV"],
        ["10", "Siege Tank"], ["11", "Thor"],
        ["12", "Viking"], ["13", "Archon"],
        ["14", "Carrier"], ["15", "Colossus"],
        ["16", "Dark Templar"], ["17", "High Templar"],
        ["18", "Immortal"], ["19", "Mothership"],
        ["20", "Observer"], ["21", "Phoenix"],
        ["22", "Probe"], ["23", "Sentry"],
        ["24", "Stalker"], ["25", "Void Ray"],
        ["26", "Zealot"], ["27", "Corruptor"],
        ["28", "Drone"], ["29", "Hydralisk"],
        ["30", "Mutalisk"], ["31", "Overlord"],
        ["32", "Queen"], ["33", "Roach"],
        ["34", "Ultralisk"], ["35", "Zergling"],
        ["38", "Infestor"], ["39", "Warp Prism"],
        ["40", "Battle Hellion"], ["41", "Warhound"],
        ["42", "Widow Mine"], ["43", "Mothership Core"],
        ["44", "Oracle"], ["45", "Tempest"],
        ["46", "Swarm Host"], ["47", "Viper"]
    ])

    private readonly morphs = new Map([
        ["00", "Orbital Command"], ["01", "Planetary Fortress"],
        ["02", "Warp Gate"], ["03", "Lair"],
        ["04", "Hive"], ["05", "Greater Spire"],
        ["06", "Brood Lord"], ["07", "Baneling"],
        ["08", "Overseer"]
    ])

    private readonly upgrades = new Map([
        ["00", "Terran Building Armor"], ["01", "Terran Infantry Armor"],
        ["02", "Terran Infantry Weapons"], ["03", "Terran Ship Plating"],
        ["04", "Terran Ship Weapons"], ["05", "Terran Vehicle Plating"],
        ["06", "Terran Vehicle Weapons"], ["07", "250mm Strike Cannons"],
        ["08", "Banshee - Cloaking"], ["09", "Ghost - Cloaking"],
        ["10", "Hellion - Pre-igniter"], ["11", "Marine - Stimpack"],
        ["12", "Raven - Seeker Missiles"], ["13", "Siege Tank - Siege Tech"],
        ["14", "Bunker - Neosteel Frame"], ["15", "Marauder - Concussive Shells"],
        ["16", "Marine - Combat Shields"], ["17", "Reaper Speed"],
        ["18", "Protoss Ground Armor"], ["19", "Protoss Ground Weapons"],
        ["20", "Protoss Air Armor"], ["21", "Protoss Air Weapons"],
        ["22", "Protoss Shields"], ["23", "Sentry - Hallucination"],
        ["24", "High Templar - Psi Storm"], ["25", "Stalker - Blink"],
        ["26", "Warp Gate Tech"], ["27", "Zealot - Charge"],
        ["28", "Zerg Ground Carapace"], ["29", "Zerg Melee Weapons"],
        ["30", "Zerg Flyer Carapace"], ["31", "Zerg Flyer Weapons"],
        ["32", "Zerg Missile Weapons"], ["33", "Hydralisk - Grooved Spines"],
        ["34", "Overlord - Pneumatized Carapace"], ["35", "Overlord - Ventral Sacs"],
        ["36", "Roach - Glial Reconstitution"], ["38", "Roach - Tunneling Claws"],
        ["40", "Ultralisk - Chitinous Plating"], ["41", "Zergling - Adrenal Glands"],
        ["42", "Metabolic Boost"], ["44", "Burrow"],
        ["45", "Centrifugal Hooks"], ["46", "Ghost - Moebius Reactor"],
        ["47", "Extended Thermal Lance"], ["48", "(REMOVED FROM GAME) Khaydarin Amulet"],
        ["49", "Neural Parasite"], ["50", "Pathogen Gland"],
        ["51", "Battlecruiser - Behemoth Reactor"], ["52", "Battlecruiser - Weapon Refit"],
        ["53", "Hi-Sec Auto Tracking"], ["54", "Medivac - Caduceus Reactor"],
        ["55", "Raven - Corvid Reactor"], ["56", "Raven - Durable Materials"],
        ["57", "Hellion - Transformation Servos"], ["58", "Carrier - Graviton Catapult"],
        ["59", "Observer - Gravitic Boosters"], ["60", "Warp Prism - Gravitic Drive"],
        ["61", "Oracle - Bosonic Core"], ["62", "Tempest - Gravity Sling"],
        ["63", "Ultralisk - Evolve Burrow Charge"], ["64", "Swarm Host - Evolve Enduring Locusts"],
        ["65", "Hydralisk - Muscular Augments"], ["66", "Drilling Claws"],
        ["67", "Anion Pulse-Crystals"]
    ])

    private readonly action_type_map = new Map([
        [SaltActionType.STRUCTURE, this.structures],
        [SaltActionType.UNIT, this.units],
        [SaltActionType.MORPH, this.morphs],
        [SaltActionType.UPGRADE, this.upgrades],
    ])

    private readonly get_symbol_val = (key: string): number => {
        // TODO: Pass local failure array here to populate
        const val = this.symbol_map.get(key)
        if (!val) return 0 // POpulate
        return val
    }

    private readonly valid_bo_input = (bo: string): boolean => bo.length > 1

    private readonly resolve_type_item_id = (type: number, item_id: number, l_idx: number, v5: boolean = false): MappedValue<StepActionBase> | FailureData => {
        log(`type val: (${type}), item_id val: (${String(item_id)})`)
        const type_group_map = this.action_type_map.get(type)
        if (!type_group_map) {
            log("invalid type_val", "error")
            return { type: "error", reason: "(Resolve) Failed to find action type group" }
        }
        const f_item_id = item_id < 10 ? `0${item_id}` : String(item_id)
        const action = type_group_map.get(f_item_id)
        if (!action) {
            log("invalid item_id_val", "error")
            return { type: "warning", reason: "(Resolve) No action found with this item_id" }
        }
        log(`action: ${action}`)
        return { map_id: gen_map_id(l_idx, BuildOrderBlockId.ACTION), value: { action: action, count: 1 } }
    }

    public gen_salt_from_json = (steps: Step[]): BuildOrderBlock[] => {
        const res: BuildOrderBlock[] = [
            { id: "", content: "!" },
            { id: "", content: "<title>" },
            { id: "", content: this.SECTION_DELIMITER },
        ]
        steps.forEach((step: Step, l_idx: number) => {
            // step.actions.forEach() <--- becauise SALT does not support 'count'
            const g_map = (l_idx: number, idx: number) => `${l_idx}${idx}`
            const supply = salt_symbol_from_val(this.symbol_map, step.supply.value - this.SUPPLY_SHIFT)?.[0] || this.ERR_CHAR
            const minutes = salt_symbol_from_val(this.symbol_map, step.minutes.value)?.[0] || this.ERR_CHAR
            const seconds = salt_symbol_from_val(this.symbol_map, step.seconds.value)?.[0] || this.ERR_CHAR
            // Backtrack from Item id -> Action type -> Values
            let action_type: string = this.ERR_CHAR
            let item_id: string = this.ERR_CHAR
            const categories = [this.structures, this.units, this.morphs, this.upgrades]
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i]
                if (step.actions.length === 0) return
                const res = salt_symbol_from_val(category, step.actions[0].value.action)
                if (res) {
                    item_id = salt_symbol_from_val(this.symbol_map, +res[0])?.[0] || this.ERR_CHAR
                    action_type = salt_symbol_from_val(this.symbol_map, i)?.[0] || this.ERR_CHAR
                }
            }
            res.push(
                { id: g_map(l_idx, SaltCharType.SUPPLY), content: supply },
                { id: g_map(l_idx, SaltCharType.MINUTES), content: minutes },
                { id: g_map(l_idx, SaltCharType.SECONDS), content: seconds },
                { id: g_map(l_idx, SaltCharType.TYPE), content: action_type },
                { id: g_map(l_idx, SaltCharType.TYPE), content: item_id },
            )
        })
        return res
    }

    public get_bo_version = (bo: string): number | FailureData => {
        if (!this.valid_bo_input(bo)) return { type: "error", reason: "Empty BO" }
        const val = this.symbol_map.get(bo.charAt(this.VERSION_CHAR_IDX))
        if (!val) return { type: "error", reason: "Failed to get version" }
        return val
    }

    public get_bo_title = (bo: string): string | FailureData => {
        if (!this.valid_bo_input(bo)) return { type: "error", reason: "Empty BO" }
        const title_end_idx = bo.indexOf(this.SECTION_DELIMITER)
        return bo.substring(this.VERSION_CHAR_IDX + 1, title_end_idx)
    }

    public get_bo_content = (bo: string): string | FailureData => {
        if (!this.valid_bo_input(bo)) return { type: "error", reason: "Empty BO" }
        const title_end_idx = bo.indexOf(this.SECTION_DELIMITER)
        const content = String.raw`${bo.substring(title_end_idx + 1, bo.length)}`
        return content
    }

    // Split SALT BO content into 5-char chunk array
    public get_bo_chunks = (bo: string): Array<string> | FailureData => {
        try {
            if (bo.length < this.CHUNK_LENGTH) {
                return { type: "warning", reason: `SALT Chunk is not of size (${this.CHUNK_LENGTH})` }
            }
            const res: Array<string> = []
            for (let i = 0; i < bo.length; i += this.CHUNK_LENGTH) {
                res.push(bo.slice(i, i + this.CHUNK_LENGTH))
            }
            return res
        } catch (err) {
            format_err(err)
            return { type: "error", reason: "Unknwon error occurred. Check the console" }
        }
    }

    // SALT v1-v4
    public decode_chunk = (chunk: string, l_idx: number): Step => {
        const fails: FailureData[] = []
        log(`chunk content: "${[chunk.split('').map((_, idx) => chunk.charAt(idx))]}", length: (${chunk.length})`)
        if (!this.valid_bo_input(chunk)) fails.push({ type: "error", reason: "Empty BO" })
        if (chunk.length < this.CHUNK_LENGTH) fails.push({ type: "warning", reason: `Chunk is not of length (${this.CHUNK_LENGTH})` })
        const [supply, minutes, seconds, type, item_id] = Object.keys(SaltCharType).map((_, idx) => this.get_symbol_val(chunk.charAt(idx)))
        log(`chunk content (values): ${[supply, minutes, seconds, type, item_id]}, length: (${chunk.length})`)
        const action = this.resolve_type_item_id(type, item_id, l_idx)
        if ("reason" in action) fails.push({ type: action.type, reason: action.reason })
        return {
            supply: { map_id: gen_map_id(l_idx, BuildOrderBlockId.SUPPLY), value: supply + this.SUPPLY_SHIFT },
            minutes: { map_id: gen_map_id(l_idx, BuildOrderBlockId.MINUTES), value: minutes },
            seconds: { map_id: gen_map_id(l_idx, BuildOrderBlockId.MINUTES), value: seconds },
            actions: ("reason" in action) ? [] : [action],
            fails,
        }
    }

}