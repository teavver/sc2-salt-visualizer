import { Flex, Box } from "@chakra-ui/react";
import { BuildOrderBlock } from "../../../salt/types";
import { ConversionMode } from "../App";
import { propertyColorMap, propertyIdMap } from "./Property";
import { gen_map_id } from "../../../salt/utils";

export const Mappings = (props: { classic: Array<BuildOrderBlock[]>, salt: Array<BuildOrderBlock>, convMode: ConversionMode }) => {

    const saltMap = props.salt.map((_, idx) => idx)
    const classicMap = props.classic.map((block_arr, line_idx) => {
        return block_arr.map((block, idx) => {
            return { line_idx, idx }
        })
    })

    const mappings: BuildOrderBlock[] = []
    for (let i = 0; i < classicMap.length; i++) {
        for (let j = 0; j < classicMap[i].length; j++) {
            const SALT_CHUNK_SIZE = 5 // Tidy this later
            const salt = String((i * SALT_CHUNK_SIZE) + j)
            const cl = `${i}:${j}`
            if (props.convMode === "CL->SALT") {
                mappings.push({ id: gen_map_id(i, j), content: `${cl}->${salt}` })
            } else mappings.push({ id: gen_map_id(i, j), content: `${salt}->${cl}` })
        }
    }

    return (
        <Flex w={"100%"} gap={1}>
            {mappings.map((mapping: BuildOrderBlock, idx: number) => (
                <Flex
                    className="cursor-default" direction={"row"} key={idx}
                    backgroundColor={propertyColorMap.get(propertyIdMap.get(idx % 5))}
                >
                    <span id={mapping.id} className="p-1 text-sm font-mono whitespace-nowrap">{mapping.content}</span>
                </Flex>
            ))}
        </Flex>
    )
}