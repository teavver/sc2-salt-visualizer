import { BuildOrderBlock } from "../../../salt/types"
import { Table, Thead, Tbody, Tr, Th, Td, Box } from "@chakra-ui/react"
import { propertyColorMap, propertyIdMap } from "../utils/property"

export const ClassicBO = (props: { blocks: Array<BuildOrderBlock[]> }) => {
    return (
        <Table variant="simple" size="md">
            <Thead>
                <Tr gap={2}>
                    <Th fontSize={10} py={1} px={0} w="50px">Supply</Th>
                    <Th fontSize={10} py={1} px={0} w="24px">Min</Th>
                    <Th fontSize={10} py={1} px={0} w="32px">Sec</Th>
                    <Th fontSize={10} py={1} px={0}>Action</Th>
                </Tr>
            </Thead>
            <Tbody>
                {props.blocks.map((blocks_arr: BuildOrderBlock[], rowIdx: number) => (
                    <Tr key={rowIdx} className="cursor-default" p={0}>
                        {['supply', 'minutes', 'seconds', 'action'].map((_, colIdx) => (
                            <Td key={colIdx} whiteSpace="nowrap" p={0}>
                                <Box
                                    backgroundColor={propertyColorMap.get(propertyIdMap.get(colIdx) || "")} my={1} w={"min-content"}
                                >
                                    <span
                                        id={blocks_arr[colIdx]?.id}
                                        className="p-1 select-none whitespace-nowrap text-base"
                                    >
                                        {blocks_arr[colIdx]?.content || ''}
                                    </span>
                                </Box>
                            </Td>
                        ))}
                    </Tr>
                ))}
            </Tbody>
        </Table>
    )
}