import { FailureData, Step, StepActionBase } from "./parser.js"
import { format_err } from "./utils.js"

export interface SALT_Metadata {
    version: number
}

const enum SALT_Chunk {
    SUPPLY = 0,
    MINUTES,
    SECONDS,
    TYPE,
    ITEM_ID,
}

const enum SALT_Action_Type {
    STRUCTURE = 0,
    UNIT,
    MORPH,
    UPGRADE
}

export class SALT {

    // Version is always the first character of any SALT string
    private readonly VERSION_CHAR_IDX: number = 0
    // End of title section is always denoted with a "~" character
    private readonly SECTION_DELIMITER: string = "~"
    // Supply amount is shifted to the left by (4)
    private readonly SUPPLY_SHIFT: number = 4
    // [Supply][Minutes][Seconds][Type][Item Id]
    private readonly CHUNK_LENGTH: number = 5

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
        ["42", "Zergling - Metabolic Boost"], ["44", "Burrow"],
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

    private readonly get_symbol_val = (key: string): number => {
        // TODO: Pass local failure array here to populate
        const val = this.symbol_map.get(key)
        if (!val) return 0 // POpulate
        return val
    }

    private readonly valid_bo_input = (bo: string): boolean => bo.length > 1

    private readonly find_type_group = (type: number): Map<string, string> | null => {
        switch (type) {
            case SALT_Action_Type.STRUCTURE:
                return this.structures
            case SALT_Action_Type.UNIT:
                return this.units
            case SALT_Action_Type.MORPH:
                return this.morphs
            case SALT_Action_Type.UPGRADE:
                return this.upgrades
            default:
                return null
        }
    }

    private readonly resolve_type_item_id = (type: number, item_id: number): StepActionBase | FailureData => {
        const type_group_map = this.find_type_group(type)
        if (!type_group_map) {
            return { type: "error", reason: "(Resolve) Failed to find action type group" }
        }
        const action = type_group_map.get(item_id.toString())
        if (!action) {
            return { type: "warning", reason: "(Resolve) No action found with this item_id" }
        }
        return { action, count: 1 }
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
            if (bo.length < this.CHUNK_LENGTH || bo.length % this.CHUNK_LENGTH !== 0) {
                return { type: "warning", reason: "SALT Chunk is incomplete or corrupted" }
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

    public decode_chunk = (chunk: string): Step | FailureData => {
        if (!this.valid_bo_input(chunk)) return { type: "error", reason: "Empty BO" }
        if (chunk.length < this.CHUNK_LENGTH) return { type: "error", reason: `Chunk is not of length (${this.CHUNK_LENGTH})` }
        const supply_val = this.get_symbol_val(chunk.charAt(SALT_Chunk.SUPPLY))
        const minutes = this.get_symbol_val(chunk.charAt(SALT_Chunk.MINUTES))
        const seconds = this.get_symbol_val(chunk.charAt(SALT_Chunk.SECONDS))
        const action_type = this.get_symbol_val(chunk.charAt(SALT_Chunk.TYPE))
        const action_item_id = this.get_symbol_val(chunk.charAt(SALT_Chunk.ITEM_ID))
        const action = this.resolve_type_item_id(action_type, action_item_id)
        if ("reason" in action) { return { type: action.type, reason: action.reason } }
        return {
            supply: supply_val + this.SUPPLY_SHIFT,
            minutes,
            seconds,
            actions: [action]
        }
    }

}