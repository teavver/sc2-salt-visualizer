import { Flex, Tag, Card, CardBody, Code } from "@chakra-ui/react"
import { FailureData } from "../../../salt/types"

interface InfoData {
    type: "info",
    reason: string
}

export const InfoCard = (props: { data: InfoData | FailureData }) => {

    const getStyles = (): object => {
        let styles = {
            backgroundColor: "#2d3748",
            colorScheme: "gray"
        }
        switch (props.data.type) {
            case "info":
                return styles
            case "warning":
                return styles = {
                    backgroundColor: "#a34f0a",
                    colorScheme: "orange"
                }
            case "error":
                return styles = {
                    backgroundColor: "#ad2828",
                    colorScheme: "red"
                }
            default:
                console.warn("Invalid InfoCard")
                return styles
        }
    }

    const s = getStyles()
    return <Card backgroundColor={s.backgroundColor} >
        <Flex grow={1}>
            <Tag w={"100%"} colorScheme={s.colorScheme} roundedBottom={0}>{props.data.type}</Tag>
        </Flex>
        <Flex p={2}>
            <Code colorScheme={s.colorScheme} children={props.data.reason} />
        </Flex>
    </Card>
}