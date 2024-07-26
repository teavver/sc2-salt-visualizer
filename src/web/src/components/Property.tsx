import { Flex } from "@chakra-ui/react";

interface PropertyProps {
    name: string
    value: string
    bracket?: "left" | "right"
}

export const propertyIdMap = new Map([
    [0, "supply"],
    [1, "minutes"],
    [2, "seconds"],
    [3, "action"],
    [4, "count"]
])

export const propertyColorMap = new Map([
    ["supply", "rgba(93, 163, 112, 0.33)"],
    ["minutes", "rgba(22, 255, 255, 0.33)"],
    ["seconds", "rgba(103, 146, 207, 0.33)"],
    ["action", "rgba(154, 109, 163, 0.33)"],
    ["count", "rgba(117, 117, 117, 0.33)"],
])

export const Property = ({ name, value, bracket }: PropertyProps) => {
    return (
        <Flex
            fontFamily={"monospace"} whiteSpace={"pre-line"}
            p={1} flexWrap={false} direction={"row"}
            backgroundColor={propertyColorMap.get(name)}
        >
            {bracket ?
                <p>{bracket === "left" ? "{" : "}"}</p>
                :
                <p>"{name}":&nbsp;{value}</p>
            }
        </Flex>
    )
}