import * as parser from "../../salt/parser";
import * as fmt from "../../salt/fmt";
import { is_err } from "../../salt/utils";
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
    UnorderedList,
    ListItem,
    Badge,
    Link,
    Select,
    Switch
} from '@chakra-ui/react';
import { FailureData, Step, StepActionBase } from "../../salt/types";
import { create_logger, jstr } from "../../salt/utils";
import { InfoCard } from "./components/FailCard";
import { Property, propertyColorMap, propertyIdMap } from "./components/Property";


interface InputData {
    userInput: string
    formatted: Array<string[]>
    needsFormat: boolean
    fail?: FailureData
}

// Contains both JSON-generated BO and the converted output
interface OutputData {
    json: Step[]
    fail?: FailureData
}

interface Settings {
    autoFormat: boolean
    showJsonOutput: boolean
}

const log = create_logger("web")

function App() {

    // TEMP HERE
    const testBO = `
        13	  0:11	  Overlord	  
        16	  0:47	  Hatchery	  
        18	  1:08	  Extractor	  
        17	  1:12	  Spawning Pool	  
        21	  1:59	  Queen x2	  
        21	  2:00	  Zergling x4	  
        27	  2:08	  Metabolic Boost	  
        27	  2:12	  Overlord	  
        28	  2:27	  Hatchery	  
        30	  2:43	  Queen	  
        33	  2:48	  Overlord	  
        36	  3:04	  Overlord	  
        36	  3:11	  Overlord	  
        41	  3:28	  Queen x2	  
        41	  3:29	  Extractor	  
        45	  3:39	  Baneling Nest	  
        45	  3:44	  Zergling x4	  
        49	  3:50	  Zergling x8	  
        53	  3:58	  Zergling x4	  
        70	  4:50	  Baneling x8	  
        74	  4:57	  Baneling x2
    `

    const [settings, setSettings] = useState<Settings>({
        autoFormat: true,
        showJsonOutput: true
    })

    const [input, setInput] = useState<InputData>({
        userInput: "", formatted: [], needsFormat: false
    })
    const [output, setOutput] = useState<OutputData>({
        json: []
    })

    const handleClearInput = () => {
        setInput({
            ...input,
            userInput: "",
            formatted: [],
            needsFormat: false,
            fail: undefined,
        })
        setOutput({ json: [] })
    }

    const handleInputChange = (inputContent: string) => {
        // Ignore whitespace and other minor changes
        const isFormatNeeded = (input.userInput).trim() !== (inputContent).trim()
        const clearErrors = inputContent === ""
        log(clearErrors)
        log(`Input change. Format: (${isFormatNeeded})`)
        setInput({
            ...input,
            userInput: inputContent,
            needsFormat: isFormatNeeded,
            fail: clearErrors ? undefined : input.fail
        })
    }

    const handleFormat = () => {
        const formatRes = fmt.format_classic_bo(input.userInput)
        if ("reason" in formatRes && input.userInput) {
            return setInput({ ...input, formatted: [], fail: formatRes, needsFormat: false })
        }
        log(jstr(formatRes))
        setInput({
            ...input,
            fail: undefined, // Clear errors
            formatted: formatRes,
            needsFormat: false
        })

        genJson(formatRes)
    }

    const genJson = (formattedBo: Array<string[]>) => {
        console.log("[genJson] ", formattedBo)
        if (!formattedBo) {
            return setOutput({
                ...output,
                fail: { type: "warning", reason: "Cannot read formatted input. Check for typos" }
            })
        }
        try {
            const lines = formattedBo.map((words: string[]) => words.join(" "))
            console.log("[EXP] lines: ", lines)
            const parseRes = parser.parse_classic_bo(lines)
            if (is_err(parseRes)) {
                return setOutput({
                    ...output,
                    fail: parseRes
                })
            }
            setOutput({
                ...output,
                json: parseRes
            })
            console.log("[res] ", parseRes)
        } catch (err) {
            console.warn(err)
            setOutput({ ...output, fail: { type: "error", reason: (err as Error).message } })
        }
    }

    const genOutput = () => {

    }

    useEffect(() => {
        if (!input.needsFormat) return
        log(`Autoformatting: '${input.userInput.substring(0, 12)}'...`)
        handleFormat()
    }, [input])

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
            <Flex direction={"column"} gap={1} px={3} pt={1}>
                {/* Main nav */}
                <Flex direction={"row"} justify={"space-between"} >
                    <Text>salt-explorer</Text>
                    <Link>dgklhjdhsgfj</Link>
                </Flex>
                {/* Settings */}
                <Flex w={"100%"} p={1} borderWidth={1} gap={3}>
                    <Flex justify="center" align="center">
                        <Button onClick={() => handleInputChange(testBO)}>Load test BO</Button>
                    </Flex>
                    <Flex justify="center" align="center">
                        <Text>Auto formatting:&nbsp;</Text>
                        <Switch defaultChecked={settings.autoFormat} onChange={() => setSettings({ ...settings, autoFormat: !settings.autoFormat })} />
                    </Flex>
                    <Flex justify="center" align="center">
                        <Text>Show JSON output:&nbsp;</Text>
                        <Switch defaultChecked={settings.showJsonOutput} onChange={() => setSettings({ ...settings, showJsonOutput: !settings.showJsonOutput })} />
                    </Flex>
                </Flex>

            </Flex>

            <Flex direction={"row"}>

                {/* Left panel */}
                <Flex direction={"column"} w={"50%"} grow={1} margin={4} justify={"space-between"} >

                    <Accordion defaultIndex={[0, 1]} allowMultiple>
                        {/* User input */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>Input</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
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
                        {/* Formatted input */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>Formatted input</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {(input.formatted.length > 0) &&
                                <AccordionPanel pb={4} maxH={"50vh"} overflowY={"auto"}>
                                    <Flex direction={"column"} gap={1}>
                                        {input.formatted.map((words: string[], idx: number) => (
                                            <Flex direction={"row"} gap={1}>
                                                {words.map((word: string, idx: number) => (
                                                    <Box backgroundColor={propertyColorMap.get(propertyIdMap.get(idx))}>
                                                        <Text p={1}>{word}</Text>
                                                    </Box>
                                                ))}
                                            </Flex>
                                        ))}
                                    </Flex>
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
                        {/* User input */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>Output (SALT)</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {/* TEMP */}
                            {(output.fail?.type === "akdhkjasd") &&
                                <AccordionPanel pb={4} maxH={"50vh"} overflowY={"auto"}>
                                    <UnorderedList>
                                        {/* Stuff */}
                                    </UnorderedList>
                                </AccordionPanel>
                            }
                        </AccordionItem>
                        {/* Formatted input */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>Output (JSON)</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {(output.json) &&
                                <AccordionPanel pb={4} maxH={"50vh"} overflowY={"auto"}>
                                    <Stack direction={"column"} gap={2}>
                                        {output.json.map((step: Step, idx: number) => {
                                            return (
                                                <Stack gap={1} direction='row' key={idx}>
                                                    <Property name="bracket" value="" bracket="left" />
                                                    <Property name="supply" value={step.supply.value} />
                                                    <Property name="minutes" value={step.minutes.value} />
                                                    <Property name="seconds" value={step.seconds.value} />
                                                    {step.actions &&
                                                        step.actions.map((action: StepActionBase, idx: number) => (
                                                            <Fragment key={idx}>
                                                                <Code children={`"action": ${action.action}`} />
                                                                <Code children={`"count": ${action.count}`} />
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
                <Accordion w={"100%"}>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as='span' flex='1' textAlign='left'>
                                    <Text>Mappings</Text>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel>
                            {/* Mappings */}
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </Flex>


        </Flex >
    )
}

export default App
