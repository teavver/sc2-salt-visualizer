import { Flex } from "@chakra-ui/react";
import { BuildOrderBlock } from "../../../salt/types";
import { ConversionMode } from "../App";
import { propertyColorMap, propertyIdMap } from "../utils/property";
import { gen_map_id } from "../../../salt/utils";
import { Salt } from "../../../salt/salt";

export const Mappings = (props: { classic: Array<BuildOrderBlock[]>, salt: Array<BuildOrderBlock>, convMode: ConversionMode }) => {
    const classicMap = props.classic.map((block_arr, line_idx) => {
        return block_arr.map((_, idx) => {
            return { line_idx, idx }
        })
    })
    const mappings: BuildOrderBlock[] = []
    for (let i = 0; i < classicMap.length; i++) {
        for (let j = 0; j < classicMap[i].length; j++) {
            const salt = String((i * Salt.CHUNK_LENGTH) + j)
            const cl = `${i}:${j}`
            if (props.convMode === ConversionMode.CLASSIC_TO_SALT) {
                mappings.push({ id: gen_map_id(i, j), content: `${cl}->${salt}` })
            } else mappings.push({ id: gen_map_id(i, j), content: `${salt}->${cl}` })
        }
    }

    return (
        <Flex w={"100%"} gap={1}>
            {mappings.map((mapping: BuildOrderBlock, idx: number) => (
                <Flex className="cursor-default" direction={"row"} key={idx}
                    backgroundColor={propertyColorMap.get(propertyIdMap.get(idx % 5) || "")}>
                    <span id={mapping.id} className="p-1 text-sm font-mono whitespace-nowrap select-none">{mapping.content}</span>
                </Flex>
            ))}
        </Flex>
    )
}