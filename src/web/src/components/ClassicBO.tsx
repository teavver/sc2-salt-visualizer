import { BuildOrderBlock } from "../../../salt/types"
import { Flex, Box, Text } from "@chakra-ui/react"
import { propertyColorMap, propertyIdMap } from "./Property"

export const ClassicBO = (props: { blocks: Array<BuildOrderBlock[]> }) => {
    return (
        <Flex direction={"column"} gap={1}>
            {props.blocks.map((blocks_arr: Array<BuildOrderBlock[]>, idx: number) => (
                <Flex className="cursor-default" direction={"row"} gap={1} key={idx}>
                    {blocks_arr.map((block: BuildOrderBlock, idx: number) => (
                        <Box key={idx} backgroundColor={propertyColorMap.get(propertyIdMap.get(idx))}>
                            <span id={block.id} className="p-1">{block.content}</span>
                        </Box>
                    ))}
                </Flex>
            ))}
        </Flex>
    )
}