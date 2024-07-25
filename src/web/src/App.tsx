import * as parser from "../../salt/parser";
import * as fmt from "../../salt/fmt";
import { useState, useEffect } from 'react';
import {
    Box,
    Card,
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
    Badge
} from '@chakra-ui/react';
import { FailureData } from "../../salt/types";
import { create_logger, jstr } from "../../salt/utils";

interface BuildOrderInput {
    userInput: string
    formatted: Array<string>
    needsFormat: boolean
    fail?: FailureData
}

interface Settings {
    showInputAdvancedCard: boolean
}

const log = create_logger("web")

function App() {

    const [settings, setSettings] = useState<Settings>({
        showInputAdvancedCard: true
    })

    const [input, setInput] = useState<BuildOrderInput>({
        userInput: "", formatted: [], needsFormat: false
    })
    const [output, setOutput] = useState<string>("")

    const handleClearInput = () => {
        setInput({
            ...input,
            userInput: "",
            formatted: [],
            needsFormat: false,
            fail: undefined,
        })
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

    // User input auto-formatting
    const handleFormat = () => {
        // log("autoformat")
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
    }

    useEffect(() => {
        if (!input.needsFormat) return
        log(`Autoformatting: '${input.userInput.substring(0, 12)}'...`)
        handleFormat()
    }, [input])

    return (
        <Box
            w="100vw"
            h="100vh"
            minW="100vw"
            minH="100vh"
            overflow="hidden"
            display="flex"
        >

            <Flex direction={"column"} w={"50%"} grow={1} margin={4} justify={"space-between"} >

                <Accordion defaultIndex={[0, 1]} allowMultiple>
                    {/* User input */}
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as='span' flex='1' textAlign='left'>
                                    <Text>input</Text>
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
                                <UnorderedList>
                                    {input.formatted.map((line, idx) => (
                                        <ListItem marginY={1} key={idx}>{line}</ListItem>
                                    ))}
                                </UnorderedList>
                            </AccordionPanel>
                        }
                    </AccordionItem>
                </Accordion>

                {input.fail &&
                    // TODO: Make "Fail" component
                    <Card p={2} flexDirection={"column"}>
                        <Badge
                            colorScheme={(input.fail.type === "error") ? "red" : "orange"}
                            pb={1} fontFamily={"monospace"}>{input.fail.type}
                        </Badge>
                        <Code colorScheme={(input.fail.type === "error") ? "red" : "orange"}>
                            {input.fail.reason}
                        </Code>
                    </Card>
                }

            </Flex>

            <Flex direction={"column"} w={"50%"} grow={1} margin={4}>
                <Stack spacing={2}>
                    <Heading>output</Heading>
                    <Text></Text>
                </Stack>
            </Flex>

        </Box >
    )
}

export default App
