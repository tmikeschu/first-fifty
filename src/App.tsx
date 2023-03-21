import { Component, createMemo, createSignal, For } from "solid-js";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Textarea,
  OrderedList,
  ListItem,
  FormErrorMessage,
  Button,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Flex,
} from "@hope-ui/solid";
import { toWords } from "number-to-words";
import { match } from "ts-pattern";

const App: Component = () => {
  const [value, setValue] = createSignal("");
  const [maxUniqueWords, setMaxUniqueWords] = createSignal(50);
  const [maxWords, setMaxWords] = createSignal(200);

  const words = createMemo(() => {
    return value()
      .trim()
      .replace(/[^a-zA-Z' ]/g, " ")
      .replace(/(\s|\n)+/g, " ")
      .toLowerCase()
      .split(" ")
      .filter(Boolean);
  });
  const overMaxWordCount = createMemo(() => words().length > maxWords());
  const atMaxWordCount = createMemo(() => words().length === maxWords());
  const endsWithSpace = createMemo(() => value().match(/(\s|\n)$/));

  const uniqWords = createMemo(() => {
    const uniq = new Set(words());
    return [...uniq].sort();
  });

  const wordCount = createMemo(() => words().length);
  const uniqueWordCount = createMemo(() => uniqWords().length);
  const overMaxUniqueWords = createMemo(
    () => uniqueWordCount() > maxUniqueWords()
  );

  const [isDisabled, setIsDisabled] = createSignal(false);
  const [invalidAttempt, setInvalidAttempt] = createSignal("");

  return (
    <Container
      centerContent
      css={{
        maxW: "640px",
        w: "100%",
        py: "16px",
        px: "$4",
        "@md": {
          px: "$8",
        },
      }}
    >
      <VStack
        gap="$4"
        css={{
          w: "100%",
        }}
      >
        <VStack as="header">
          <Heading
            as="h1"
            size="xl"
            css={{
              color: "$primary10",
            }}
          >
            First {capitalize(toWords(maxUniqueWords()))}
          </Heading>
          <Text size="sm" css={{ color: "$neutral11" }}>
            Write{" "}
            <Text as="b" css={{ color: "$primary10" }}>
              {maxWords()}
            </Text>{" "}
            words, using the first{" "}
            <Text as="b" css={{ color: "$primary10" }}>
              {maxUniqueWords()}
            </Text>{" "}
            words you write.
          </Text>
        </VStack>

        <Stack css={{ gap: "$2" }}>
          <FormControl>
            <FormLabel for="maxUniqueWords">Max unique words</FormLabel>
            <Input
              max={maxWords()}
              id="maxUniqueWords"
              type="number"
              value={maxUniqueWords()}
              onInput={(e) => setMaxUniqueWords(Number(e.currentTarget.value))}
            />
          </FormControl>

          <FormControl>
            <FormLabel for="maxWords">Target word count</FormLabel>
            <Input
              min={maxUniqueWords()}
              id="maxWords"
              type="number"
              value={maxWords()}
              onInput={(e) => setMaxWords(Number(e.currentTarget.value))}
            />
          </FormControl>
        </Stack>

        <FormControl>
          <Textarea
            css={{
              height: "$sm",
              px: "8px",
              py: "4px",
              resize: "none",
            }}
            rows="1"
            disabled={isDisabled()}
            value={value()}
            onInput={(e) => {
              const defaultHandler = () => {
                setInvalidAttempt("");
                setValue(e.currentTarget.value);
              };
              if (overMaxUniqueWords()) {
                const lastWord = (e.currentTarget.value.split(" ").pop() ?? "")
                  .replace(/[^a-zA-Z' ]/g, "")
                  .toLowerCase();
                if (!uniqWords().some((w) => w.startsWith(lastWord))) {
                  e.currentTarget.value = value();
                  setInvalidAttempt(lastWord);
                  e.currentTarget.blur();
                } else {
                  defaultHandler();
                }
              } else {
                defaultHandler();
              }

              if (overMaxWordCount() || (atMaxWordCount() && endsWithSpace())) {
                setIsDisabled(true);
                setValue((v) => v.trim());
              }
            }}
          />
          <Flex css={{ justifyContent: "flex-end", w: "$full" }}>
            <FormHelperText
              css={{
                color: atMaxWordCount()
                  ? "$success10"
                  : overMaxWordCount()
                  ? "$danger10"
                  : undefined,
              }}
            >
              {wordCount()}/{maxWords()}
            </FormHelperText>
          </Flex>
          <FormErrorMessage></FormErrorMessage>
        </FormControl>

        {invalidAttempt() ? (
          <Alert status="danger">
            <AlertIcon mr="$2_5" />
            <AlertTitle mr="$2_5">{invalidAttempt()}</AlertTitle>
            <AlertDescription>
              doesn't match your first fifty words.
            </AlertDescription>
          </Alert>
        ) : null}

        {isDisabled() ? (
          <Button onClick={() => setIsDisabled(false)}>Revise</Button>
        ) : null}

        <VStack
          css={{
            width: "$full",
            alignItems: "flex-start",
          }}
        >
          <Heading
            as="h3"
            css={{
              color: match(uniqueWordCount())
                .with(0, () => "$neutral8")
                .when(
                  (x) => x === maxUniqueWords(),
                  () => "$success10"
                )
                .when(
                  (x) => x > maxUniqueWords(),
                  () => "$warning10"
                )
                .otherwise(() => "$neutral11"),
            }}
          >
            Unique Words ({uniqueWordCount()})
          </Heading>

          <OrderedList
            css={{
              color: "$neutral11",
              listStylePosition: "inside",
              ml: 0,
              width: "$full",
              columns: 2,
              "@md": {
                columns: 4,
              },
            }}
          >
            <For each={uniqWords()}>
              {(item) => <ListItem>{item}</ListItem>}
            </For>
          </OrderedList>
        </VStack>
      </VStack>
    </Container>
  );
};

export default App;

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
