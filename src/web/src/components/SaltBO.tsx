import { BuildOrderBlock } from "../../../salt/types"
import { Flex, Box, Code } from "@chakra-ui/react"
import { propertyColorMap, propertyIdMap } from "../utils/property"

export const SaltBO = (props: { blocks: Array<BuildOrderBlock> }) => {
    const blocksCopy = [...props.blocks]
    const titleSection = blocksCopy.splice(0, 3) // extract [version, title, titleEnd]
    return (
        <Flex direction={"row"} w={"100%"} gap={1}>
            <Flex justify="center" align="center" gap={1}>
                {titleSection.map((v, i) => (
                    <Code key={i}>{v.content}</Code>
                ))}
            </Flex>
            {blocksCopy.map((block: BuildOrderBlock, idx: number) => (
                <Flex className="cursor-default" direction={"row"} gap={1} key={idx}>
                    <Box backgroundColor={propertyColorMap.get(propertyIdMap.get(idx % 5) || "")}>
                        <span id={block.id} className="select-none whitespace-nowrap p-1 text-lg">
                            {block.content === " " ? "˽" : block.content}
                        </span>
                    </Box>
                </Flex>
            ))}
        </Flex>
    )
}
