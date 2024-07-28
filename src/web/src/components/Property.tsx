import { Flex } from "@chakra-ui/react";

interface PropertyProps {
    id: string
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
    ["minutes", "rgba(140, 166, 207, 0.33)"],
    ["seconds", "rgba(103, 146, 207, 0.33)"],
    ["action", "rgba(154, 109, 163, 0.33)"],
    ["count", "rgba(117, 117, 117, 0.33)"],
])

export const Property = ({ id, name, value, bracket }: PropertyProps) => {
    return (
        <Flex
            fontFamily={"monospace"} flexWrap={false}
            direction={"row"} borderRadius={2}
            backgroundColor={propertyColorMap.get(name)}
            className="cursor-default"
        >
            {bracket ?
                <span className="p-1">{bracket === "left" ? "{" : "}"}</span>
                :
                <span id={id} className="p-1 whitespace-nowrap">"{name}":
                    <span id={id} className="font-bold">{" "}{value}</span>
                </span>
            }
        </Flex>
    )
}