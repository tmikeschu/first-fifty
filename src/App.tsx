import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
} from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

const App: Component = () => {
  const [value, setValue] = createSignal("");

  const words = createMemo(() => {
    return value()
      .trim()
      .replace(/[^a-zA-Z' ]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .filter(Boolean);
  });
  const atMaxWordCount = createMemo(() => words().length === 200);
  const endsWithSpace = createMemo(() => value().match(/(\s|\n)$/));

  const uniqWords = createMemo(() => {
    const uniq = new Set(words());
    return [...uniq].sort();
  });

  const wordCount = createMemo(() => words().length);
  const uniqueWordCount = createMemo(() => uniqWords().length);
  const atFifty = createMemo(() => uniqueWordCount() > 50);

  const [isDisabled, setIsDisabled] = createSignal(false);
  const [invalidAttempt, setInvalidAttempt] = createSignal("");

  return (
    <div class={styles.App}>
      <header>
        <h1>First Fifty</h1>
        <p>
          Write 200 words, using only the <b>first fifty</b> words you write.
        </p>
      </header>
      <textarea
        rows="1"
        class={styles.textarea}
        disabled={isDisabled()}
        value={value()}
        onInput={(e) => {
          if (atFifty()) {
            const lastWord = (e.currentTarget.value.split(" ").pop() ?? "")
              .replace(/[^a-zA-Z' ]/g, "")
              .toLowerCase();
            if (!uniqWords().some((w) => w.startsWith(lastWord))) {
              e.currentTarget.value = value();
              setInvalidAttempt(lastWord);
              e.currentTarget.blur();
            } else {
              setInvalidAttempt("");
              setValue(e.currentTarget.value);
            }
          } else {
            setInvalidAttempt("");
            setValue(e.currentTarget.value);
          }
          if (atMaxWordCount() && endsWithSpace()) {
            setIsDisabled(true);
            setValue((v) => v.trim());
          }
        }}
      />
      {invalidAttempt() ? (
        <p class={styles.invalidAttempt}>
          <b>{invalidAttempt()}</b> doesn't match your first fifty words.
        </p>
      ) : null}

      <p classList={{ [styles.atMaxWordCount]: atMaxWordCount() }}>
        Words {wordCount()}/200
      </p>
      {isDisabled() ? (
        <button onClick={() => setIsDisabled(false)}>Revise</button>
      ) : null}
      <h3 classList={{ [styles.uniqueWordsAtCapacity]: atFifty() }}>
        Unique Words ({uniqueWordCount()})
      </h3>
      <ol class={styles.wordList}>
        <For each={uniqWords()}>
          {(item) => <li class={styles.wordList__item}>{item}</li>}
        </For>
      </ol>
    </div>
  );
};

export default App;
