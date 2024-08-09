import { Flex } from "@chakra-ui/react";
import { propertyColorMap } from "../utils/property";

interface PropertyProps {
    id: string
    name: string
    value: string
    bracket?: "left" | "right"
}

export const Property = ({ id, name, value, bracket }: PropertyProps) => {
    return (
        <Flex
            fontFamily={"monospace"}
            direction={"row"} borderRadius={2}
            backgroundColor={propertyColorMap.get(name)}
            className="cursor-default"
        >
            {bracket ?
                <span className="p-1 select-none">{bracket === "left" ? "{" : "}"}</span>
                :
                <span id={id} className="p-1 whitespace-nowrap select-none">"{name}":
                    <span id={id} className="font-bold">{" "}{value}</span>
                </span>
            }
        </Flex>
    )
}