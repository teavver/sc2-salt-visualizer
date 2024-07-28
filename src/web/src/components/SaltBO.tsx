import { BuildOrderBlock } from "../../../salt/types"
import { Flex, Box, Text, Code } from "@chakra-ui/react"
import { propertyColorMap, propertyIdMap } from "./Property"
import { jstr } from "../../../salt/utils"

export const SaltBO = (props: { blocks: Array<BuildOrderBlock> }) => {
    const blocksCopy = [...props.blocks]
    const titleSection = blocksCopy.splice(0, 3) // extract [version, title, titleEnd]
    return (
        <Flex direction={"row"} w={"100%"} gap={1}>
            {titleSection.map((v, i) => (
                <Code key={i}>{v.content}</Code>
            ))}
            {blocksCopy.map((block: BuildOrderBlock, idx: number) => (
                <Flex className="cursor-default" direction={"row"} gap={1} key={idx}>
                    <Box key={idx} backgroundColor={propertyColorMap.get(propertyIdMap.get(idx % 5))}>
                        <span id={block.id} className="whitespace-nowrap p-1 text-lg">
                            {block.content === " " ? "˽" : block.content}
                        </span>
                    </Box>
                </Flex>
            ))}
        </Flex>
    )
}