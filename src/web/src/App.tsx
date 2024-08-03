import * as parser from "../../salt/parser";
import * as fmt from "../../salt/fmt";
import { is_err } from "../../salt/utils";
import { Mappings } from "./components/Mappings";
import { useState, useEffect, Fragment, useRef } from 'react';
import {
    Box,
    Button,
    Flex,
    Text,
    Input,
    Stack,
    Accordion,
    AccordionButton,
    AccordionPanel,
    AccordionItem,
    AccordionIcon,
    InputGroup,
    InputRightElement,
    Divider,
    Link,
    Switch,
    Heading
} from '@chakra-ui/react';
import { FailureData, MappedValue, Step, StepActionBase, BuildOrderBlock } from "../../salt/types";
import { create_logger } from "../../salt/utils";
import { InfoCard } from "./components/FailCard";
import { Property } from "./components/Property";
import { ClassicBO } from "./components/ClassicBO";
import { gen_classic_from_json } from "../../salt/classic";
import { isElementVisible } from "./utils/utils";
import { Salt } from "../../salt/salt";
import { SaltBO } from "./components/SaltBO";
import { sampleClassic, sampleSalt } from "./utils/samples";

export enum ConversionMode {
    CLASSIC_TO_SALT = 0,
    SALT_TO_CLASSIC = 1,
}

interface InputData {
    userInput: string
    needsUpdate: boolean
    fail?: FailureData
}

// Contains both JSON-generated BO and the converted output
interface OutputData {
    json: Step[]
    classic: Array<BuildOrderBlock[]>
    salt: Array<BuildOrderBlock>
    fail?: FailureData
}

interface Settings {
    showJsonOutput: boolean
    showMappings: boolean
    convMode: ConversionMode
    scrollSync: boolean
}

const log = create_logger("web")

function App() {

    const [settings, setSettings] = useState<Settings>({
        showJsonOutput: true,
        showMappings: true,
        convMode: ConversionMode.SALT_TO_CLASSIC,
        scrollSync: true,
    })
    const scrollSyncRef = useRef(settings.scrollSync)

    const [input, setInput] = useState<InputData>({
        userInput: "", fail: undefined, needsUpdate: false
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
            needsUpdate: needsUpdate,
            fail: clearErrors ? undefined : input.fail
        })
        setOutput({ ...output })
    }

    const handleFormat = () => {
        const formatRes = (settings.convMode === ConversionMode.CLASSIC_TO_SALT)
            ? fmt.format_classic_bo(input.userInput)
            : fmt.format_salt_bo(input.userInput)
        if (is_err(formatRes) && input.userInput) {
            return setInput({ ...input, fail: formatRes, needsUpdate: false })
        }
        log("formatted: " + formatRes)
        genJson(formatRes as (string | string[]))
    }

    const genJson = (bo: string | Array<string>) => {
        if (!bo) {
            return setOutput({
                ...output,
                fail: { type: "warning", reason: "Cannot read blocks input. Check for typos" }
            })
        }
        try {
            const parseRes = (settings.convMode === ConversionMode.CLASSIC_TO_SALT)
                ? parser.parse_classic_bo(bo as string[])
                : parser.parse_salt_bo(bo as string)

            console.log('parseRes ', parseRes)
            if (is_err(parseRes)) {
                return setOutput({
                    ...output,
                    fail: parseRes
                })
            }
            setOutput({
                ...output,
                json: parseRes,
                classic: genClassicFromJSON(parseRes),
                salt: genSaltFromJSON(parseRes),
            })
        } catch (err) {
            console.error(err)
            setOutput({
                ...output,
                json: [], classic: [], salt: [],
                fail: { type: "error", reason: (err as Error).message }
            })
        }
    }

    const genClassicFromJSON = (steps: Step[]): Array<BuildOrderBlock[]> => {
        if (!steps) return []
        return gen_classic_from_json(steps)
    }

    const genSaltFromJSON = (steps: Step[]): BuildOrderBlock[] => {
        if (!steps) return []
        const s = new Salt()
        return s.gen_salt_from_json(steps)
    }

    useEffect(() => {
        if (!input.userInput || !input.needsUpdate) return
        log("Formatting...")
        handleFormat()
    }, [input])

    useEffect(() => {
        scrollSyncRef.current = settings.scrollSync
    }, [settings.scrollSync])

    useEffect(() => {
        const handleBlockHover = (e: MouseEvent, action: "add" | "remove") => {
            const target = e.target as HTMLElement
            if (!target || target.tagName.toLowerCase() !== "span" || !target.id) return
            document.querySelectorAll(`#${CSS.escape(target.id)}`).forEach((elem: Element) => {
                if (action === "add") {
                    elem.classList.add("bg-black", "text-white")
                    // handle scrollsync
                    if (scrollSyncRef.current && elem !== target && !isElementVisible(elem, target)) {
                        elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                } else {
                    elem.classList.remove("bg-black", "text-white")
                }
            })
        }

        const handleMouseOver = (e: MouseEvent) => handleBlockHover(e, "add")
        const handleMouseOut = (e: MouseEvent) => handleBlockHover(e, "remove")

        document.addEventListener("mouseover", handleMouseOver)
        document.addEventListener("mouseout", handleMouseOut)
        return () => {
            document.removeEventListener("mouseover", handleMouseOver)
            document.removeEventListener("mouseout", handleMouseOut)
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
                    <Heading>sc2-salt-visualizer</Heading>
                    <Link href='https://github.com/teavver/sc2-salt-visualizer'>gh</Link>
                </Flex>
                {/* Settings */}
                <Flex w={"100%"} p={1} gap={3}>
                    <Flex justify="center" align="center">
                        <Button size={"sm"} onClick={() => {
                            handleInputChange(settings.convMode === ConversionMode.CLASSIC_TO_SALT
                                ? sampleClassic
                                : sampleSalt)
                        }}>
                            Load sample build order
                        </Button>
                    </Flex>
                    <Divider orientation='vertical' />
                    <Flex gap={1} justify="center" align="center">
                        <Text>Convert:
                            <span className="ml-3 p-1 font-semibold">
                                {settings.convMode === ConversionMode.CLASSIC_TO_SALT
                                    ? "CLASSIC --> SALT"
                                    : "SALT --> CLASSIC".toString()}
                            </span>
                        </Text>
                        <Button size={"sm"} onClick={() => {
                            const oppConv = settings.convMode === ConversionMode.CLASSIC_TO_SALT
                                ? ConversionMode.SALT_TO_CLASSIC : ConversionMode.CLASSIC_TO_SALT
                            setSettings({ ...settings, convMode: oppConv })
                            setInput({ ...input, userInput: "" })
                            setOutput({ ...output, json: [], classic: [], salt: [] })
                        }}>
                            Toggle
                        </Button>
                    </Flex>
                    <Divider orientation='vertical' />
                    <Flex justify="center" align="center">
                        <Text>Show JSON output&nbsp;</Text>
                        <Switch
                            defaultChecked={settings.showJsonOutput}
                            onChange={() => setSettings({ ...settings, showJsonOutput: !settings.showJsonOutput })}
                        />
                    </Flex>
                    <Divider orientation='vertical' />
                    <Flex justify="center" align="center">
                        <Text>Show Mappings&nbsp;</Text>
                        <Switch
                            defaultChecked={settings.showMappings}
                            onChange={() => setSettings({ ...settings, showMappings: !settings.showMappings })}
                        />
                    </Flex>
                    <Divider orientation='vertical' />
                    <Flex justify="center" align="center">
                        <Text>ScrollSync&nbsp;</Text>
                        <Switch
                            defaultChecked={settings.scrollSync}
                            onChange={() => setSettings({ ...settings, scrollSync: !settings.scrollSync })}
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
                                            Input ({settings.convMode === ConversionMode.CLASSIC_TO_SALT ? "CLASSIC" : "SALT"})
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
                                        <Text>Classic Output</Text>
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
                        index={[0, settings.showJsonOutput ? 1 : 0]}
                    >
                        {/* Output - SALT Notation */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>
                                        <Text>
                                            SALT Output
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
                                        <Text>JSON Output</Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            {(output.json.length > 0) &&
                                <AccordionPanel bg={"whiteAlpha.50"} maxH={"50vh"} overflowY={"auto"}>
                                    <Stack direction={"column"} gap={2}>
                                        {output.json.map((step: Step, idx: number) => {
                                            return (
                                                <Flex gap={1} direction={'column'} key={idx}>
                                                    <Stack gap={1} direction='row'>
                                                        <Property id="" name="bracket" value="" bracket="left" />
                                                        <Property id={step.supply.map_id} name="supply" value={String(step.supply.value)} />
                                                        <Property id={step.minutes.map_id} name="minutes" value={String(step.minutes.value)} />
                                                        <Property id={step.seconds.map_id} name="seconds" value={String(step.seconds.value)} />
                                                        {step.actions &&
                                                            step.actions.map((action: MappedValue<StepActionBase>, idx: number) => (
                                                                <Fragment key={idx}>
                                                                    <Property id={action.map_id} name="action" value={action.value.action} />
                                                                    <Property id={action.map_id} name="count" value={String(action.value.count)} />
                                                                </Fragment>
                                                            ))
                                                        }
                                                        <Property id="" name="bracket" value="" bracket="right" />
                                                    </Stack>
                                                    {step.fails && (
                                                        Array.isArray(step.fails)
                                                            ? step.fails.map((fail: FailureData, idx: number) => (
                                                                <InfoCard data={fail} key={idx} />
                                                            ))
                                                            : <InfoCard data={step.fails} />
                                                    )}
                                                </Flex>
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
                            <AccordionPanel bg={"whiteAlpha.50"} px={4} pb={4} w={"100%"} overflowX={"auto"}>
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
