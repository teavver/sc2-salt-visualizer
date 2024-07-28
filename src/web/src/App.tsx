import * as parser from "../../salt/parser";
import * as fmt from "../../salt/fmt";
import { is_err } from "../../salt/utils";
import { Mappings } from "./components/Mappings";
import { useState, useEffect, Fragment } from 'react';
import {
    Box,
    Card,
    CardBody,
    Code,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    Stack,
    StepTitle,
    Text,
    Textarea,
    Accordion,
    AccordionButton,
    AccordionPanel,
    AccordionItem,
    AccordionIcon,
    InputGroup,
    InputRightElement,
    List,
    Divider,
    UnorderedList,
    ListItem,
    Badge,
    Link,
    Select,
    Switch
} from '@chakra-ui/react';
import { FailureData, MappedValue, Step, StepActionBase, BuildOrderBlock } from "../../salt/types";
import { create_logger, jstr } from "../../salt/utils";
import { InfoCard } from "./components/FailCard";
import { Property, propertyColorMap, propertyIdMap } from "./components/Property";
import { ClassicBO } from "./components/ClassicBO";
import { gen_classic_from_json } from "../../salt/classic";
import { isElementVisible } from "./utils/utils";
import { Salt } from "../../salt/salt";
import { SaltBO } from "./components/SaltBO";
import { sampleClassic, sampleSalt } from "./utils/samples";

// Yes, I do prefer this over a boolean.
export type ConversionMode = "CL->SALT" | "SALT->CL"

interface InputData {
    userInput: string
    fail?: FailureData
}

// Contains both JSON-generated BO and the converted output
interface OutputData {
    json: Step[]
    classic: Array<BuildOrderBlock[]>
    salt: Array<BuildOrderBlock>
    needsUpdate: boolean
    fail?: FailureData
}

interface Settings {
    showJsonOutput: boolean
    showMappings: boolean
    convMode: ConversionMode
}

const log = create_logger("web")

function App() {

    const [settings, setSettings] = useState<Settings>({
        showJsonOutput: true,
        showMappings: true,
        convMode: "CL->SALT"
    })

    const [input, setInput] = useState<InputData>({
        userInput: "", fail: undefined
    })

    const [output, setOutput] = useState<OutputData>({
        json: [], classic: [], salt: []
    })

    const handleClearInput = () => {
        setInput({
            ...input,
            userInput: "",
            // needsUpdate: false,
            fail: undefined,
        })
        setOutput({ json: [], classic: [], salt: [] })
    }

    const handleInputChange = (inputContent: string) => {
        // Ignore whitespace and other minor changes
        const needsUpdate = (input.userInput).trim() !== (inputContent).trim()
        const clearErrors = inputContent === ""
        log(`Input change. Format: (${needsUpdate})`)
        setInput({
            ...input,
            userInput: inputContent,
            fail: clearErrors ? undefined : input.fail
        })
        setOutput({ ...output, needsUpdate })
    }

    const handleFormat = () => {
        const formatRes = (settings.convMode === "CL->SALT")
            ? fmt.format_classic_bo(input.userInput)
            : fmt.format_salt_bo(input.userInput)
        if (is_err(formatRes) && input.userInput) {
            return setInput({ ...input, fail: formatRes, needsUpdate: false })
        }
        log("formatted: " + formatRes)
        setInput({
            ...input,
            fail: undefined, // Clear errors
        })
        genJson(formatRes)
    }

    const genJson = (bo: string | Array<string>) => {
        // console.log("[genJson] ", blocksBo)
        if (!bo) {
            return setOutput({
                ...output,
                fail: { type: "warning", reason: "Cannot read blocks input. Check for typos" }
            })
        }
        try {
            const parseRes = (settings.convMode === "CL->SALT")
                ? parser.parse_classic_bo(bo)
                : parser.parse_salt_bo(bo)
            if (is_err(parseRes)) {
                return setOutput({
                    ...output,
                    fail: parseRes
                })
            }
            // log("parseRes " + jstr(parseRes))
            const classic = genClassicFromJSON(parseRes)
            const salt = genSaltFromJSON(parseRes)
            setOutput({
                ...output,
                json: parseRes,
                classic,
                salt,
                needsUpdate: false
            })
        } catch (err) {
            console.warn(err)
            setOutput({ ...output, fail: { type: "error", reason: (err as Error).message }, needsUpdate: false })
        }
    }

    const genClassicFromJSON = (steps: Step[]): Array<BuildOrderBlock[]> => {
        if (!steps) return
        return gen_classic_from_json(steps)
    }

    const genSaltFromJSON = (steps: Step[]): BuildOrderBlock[] => {
        if (!steps) return
        const s = new Salt()
        return s.gen_salt_from_json(steps)
    }

    useEffect(() => {
        if (!output.needsUpdate) return
        log("Formatting...")
        handleFormat()
    }, [output])

    useEffect(() => {
        const handleBlockHover = (e: MouseEvent, action: "add" | "remove") => {
            const target = e.target as HTMLElement
            if (!target || target.tagName.toLowerCase() !== "span" || !target.id) return
            document.querySelectorAll(`#${CSS.escape(target.id)}`).forEach((elem: Element) => {
                if (action === "add") {
                    elem.classList.add("bg-black")
                    if (elem !== target && !isElementVisible(elem, target)) {
                        elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                } else {
                    elem.classList.remove("bg-black")
                }
            })
        }

        document.addEventListener("mouseover", (e: MouseEvent) => handleBlockHover(e, "add"))
        document.addEventListener("mouseout", (e: MouseEvent) => handleBlockHover(e, "remove"))
        return () => {
            document.removeEventListener("mouseover", (e) => handleBlockHover(e, "add"))
            document.removeEventListener("mouseout", (e) => handleBlockHover(e, "remove"))
        }

    }, [])

    return (
        <Flex
            w="100vw"
            h="100vh"
            minW="100vw"
            minH="100vh"
            direction="column"
            overflowX="hidden"
        >

            {/* Nav */}
            <Flex direction={"column"} gap={1} borderBottomWidth={1}>
                {/* Main nav */}
                <Flex direction={"row"} justify={"space-between"} mb={1} p={1} >
                    <Text>sc2-salt-explorer</Text>
                    <Link>dgklhjdhsgfj</Link>
                </Flex>
                {/* Settings */}
                <Flex w={"100%"} p={1} gap={3}>
                    <Flex justify="center" align="center">
                        <Button size={"sm"} onClick={() => handleInputChange(settings.convMode === "CL->SALT" ? sampleClassic : sampleSalt)}>
                            Load sample BO
                        </Button>
                    </Flex>
                    <Divider orientation='vertical' />
                    <Flex gap={1} justify="center" align="center">
                        <Text>{settings.convMode === "CL->SALT" ? "(CLASSIC) -> (SALT)" : "(SALT) -> (CLASSIC"}</Text>
                        <Button size={"sm"} onClick={() => {
                            const oppConv = settings.convMode === "CL->SALT" ? "SALT->CL" : "CL->SALT"
                            setSettings({ ...settings, convMode: oppConv })
                            setInput({ ...input, userInput: "" })
                            setOutput({ ...output, json: [], classic: [], salt: [], needsUpdate: false })
                        }}>
                            Toggle
                        </Button>
                    </Flex>
                    <Divider orientation='vertical' />
                    <Flex justify="center" align="center">
                        <Text>Show JSON output:&nbsp;</Text>
                        <Switch
                            defaultChecked={settings.showJsonOutput}
                            onChange={() => setSettings({ ...settings, showJsonOutput: !settings.showJsonOutput })}
                        />
                    </Flex>
                    <Flex justify="center" align="center">
                        <Text>Show mappings</Text>
                        <Switch
                            defaultChecked={settings.showMappings}
                            onChange={() => setSettings({ ...settings, showMappings: !settings.showMappings })}
                        />
                    </Flex>
                </Flex>

            </Flex>

            <Flex direction={"row"}>

                {/* Left panel */}
                <Flex direction={"column"} w={"50%"} grow={1} margin={4} justify={"space-between"} >

                    <Accordion height={"100%"} defaultIndex={[0, 1]} allowMultiple>
                        {/* User input */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>
                                            Input ({settings.convMode === "CL->SALT" ? "CLASSIC" : "SALT"})
                                        </Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel p={1}>
                                <Stack spacing={2}>
                                    <InputGroup size='md'>
                                        <Input
                                            value={input.userInput}
                                            pr='4.5rem'
                                            onChange={(e) => handleInputChange(e.target.value)}
                                            placeholder='Paste your favorite Build Order here'
                                        />
                                        <InputRightElement width='4.5rem'>
                                            <Button h='1.75rem' size='sm' onClick={handleClearInput}>
                                                <Text>Clear</Text>
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                </Stack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* blocks input */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>Formatted input</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {(output.classic.length > 0) &&
                                <AccordionPanel pb={4} maxH={"50vh"} bg={"whiteAlpha.50"} overflowY={"auto"}>
                                    <ClassicBO blocks={output.classic} />
                                </AccordionPanel>
                            }
                        </AccordionItem>
                    </Accordion>

                    {input.fail &&
                        <InfoCard data={input.fail} />
                    }

                </Flex>

                {/* Right panel */}
                <Flex direction={"column"} w={"50%"} grow={1} margin={4}>

                    <Accordion
                        defaultIndex={[0, 1]}
                        allowMultiple
                        index={[0, settings.showJsonOutput ? 1 : undefined]}
                    >
                        {/* Output - SALT Notation */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>
                                            Output ({settings.convMode === "CL->SALT" ? "SALT" : "CLASSIC"})
                                        </Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {(output.salt.length > 0) &&
                                <AccordionPanel bg={"whiteAlpha.50"} px={4} pb={4} maxH={"50vh"} overflowY={"auto"}>
                                    <SaltBO blocks={output.salt} />
                                </AccordionPanel>
                            }
                        </AccordionItem>

                        {/* Output - JSON notation */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>Output (JSON)</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {(output.json.length > 0) &&
                                <AccordionPanel bg={"whiteAlpha.50"} maxH={"50vh"} overflowY={"auto"}>
                                    <Stack direction={"column"} gap={1}>
                                        {output.json.map((step: Step, idx: number) => {
                                            return (
                                                <Stack gap={1} direction='row' key={idx}>
                                                    <Property id="" name="bracket" value="" bracket="left" />
                                                    <Property id={step.supply.map_id} name="supply" value={step.supply.value} />
                                                    <Property id={step.minutes.map_id} name="minutes" value={step.minutes.value} />
                                                    <Property id={step.seconds.map_id} name="seconds" value={step.seconds.value} />
                                                    {step.actions &&
                                                        step.actions.map((action: MappedValue<StepActionBase>, idx: number) => (
                                                            <Fragment key={idx}>
                                                                <Property id={action.map_id} name="action" value={action.value.action} />
                                                                <Property id={action.map_id} name="count" value={action.value.count} />
                                                            </Fragment>
                                                        ))
                                                    }
                                                    <Property name="bracket" value="" bracket="right" />
                                                </Stack>
                                            )
                                        })}
                                    </Stack>
                                </AccordionPanel>
                            }
                        </AccordionItem>
                    </Accordion>

                </Flex>


            </Flex>

            {/* Bottom panel (mappings) */}
            <Flex grow={1}>
                <Accordion w={"100%"} defaultIndex={[0]}>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as='span' flex='1' textAlign='left'>
                                    <Text>Mappings</Text>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        {(output.classic.length > 0 && output.salt.length > 0 && settings.showMappings) &&
                            <AccordionPanel overflowX={"auto"} bg={"whiteAlpha.50"}>
                                <Mappings classic={output.classic} salt={output.salt} convMode={settings.convMode} />
                            </AccordionPanel>
                        }
                    </AccordionItem>
                </Accordion>
            </Flex>


        </Flex >
    )
}

export default App
