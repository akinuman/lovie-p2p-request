import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Currency input masking hook — natural typing style with cursor tracking.
 *
 * Behavior:
 * - Digits go into the dollar (integer) part by default.
 * - When user presses ".", it switches to decimal entry.
 * - After the dot, at most 2 decimal digits are accepted.
 * - Display always shows 2 decimal places and comma separators.
 * - Backspace removes digits naturally (decimal → dot → integer).
 * - Arrow keys work naturally for cursor navigation.
 * - Cursor is positioned at the logical editing point after each keystroke.
 */

const MAX_INTEGER_DIGITS = 5; // Up to 99,999

interface CurrencyInputState {
  /** The integer (dollar) digits, e.g. "1234" */
  integerPart: string;
  /** The decimal (cents) digits, e.g. "" | "5" | "56" */
  decimalPart: string;
  /** Whether the user has entered the dot yet */
  hasDot: boolean;
}

function formatDisplay(state: CurrencyInputState): string {
  const dollars = state.integerPart === "" ? "0" : state.integerPart;
  const dollarsFormatted = Number.parseInt(dollars, 10).toLocaleString("en-US");
  const centsPadded = (state.decimalPart + "00").slice(0, 2);
  return `${dollarsFormatted}.${centsPadded}`;
}

function toRawValue(state: CurrencyInputState): string {
  const dollars = state.integerPart === "" ? "0" : state.integerPart;
  const centsPadded = (state.decimalPart + "00").slice(0, 2);
  if (centsPadded === "00") return dollars;
  return `${dollars}.${centsPadded}`;
}

function toCents(state: CurrencyInputState): number {
  const dollars =
    state.integerPart === "" ? 0 : Number.parseInt(state.integerPart, 10);
  const centsPadded = (state.decimalPart + "00").slice(0, 2);
  return dollars * 100 + Number.parseInt(centsPadded, 10);
}

function parseInitialValue(value: string): CurrencyInputState {
  if (!value) return { integerPart: "", decimalPart: "", hasDot: false };

  const cleaned = value.replace(/[^0-9.]/g, "");
  const dotIndex = cleaned.indexOf(".");

  if (dotIndex === -1) {
    return { integerPart: cleaned || "", decimalPart: "", hasDot: false };
  }

  return {
    integerPart: cleaned.slice(0, dotIndex) || "",
    decimalPart: cleaned.slice(dotIndex + 1, dotIndex + 3),
    hasDot: true,
  };
}

/**
 * Compute where the cursor should be placed in the formatted display string.
 * - Integer mode: right before the "."
 * - Decimal mode: right after the last entered decimal digit
 */
function getCursorPosition(
  state: CurrencyInputState,
  displayValue: string,
): number {
  const dotPos = displayValue.indexOf(".");
  if (state.hasDot) {
    return dotPos + 1 + state.decimalPart.length;
  }
  return dotPos;
}

export function useCurrencyInput(initialValue = "", syncValue?: string) {
  const [state, setState] = useState<CurrencyInputState>(() =>
    parseInitialValue(initialValue),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursorRef = useRef<number | null>(null);
  const lastSyncValueRef = useRef(syncValue);

  // When an external syncValue changes (e.g. server resets form state),
  // reset the input to match.
  if (syncValue !== lastSyncValueRef.current) {
    lastSyncValueRef.current = syncValue;
    setState(parseInitialValue(syncValue ?? ""));
  }

  const displayValue = formatDisplay(state);
  const rawValue = toRawValue(state);
  const cents = toCents(state);

  // Apply cursor position after React updates the DOM value
  useEffect(() => {
    if (pendingCursorRef.current !== null && inputRef.current) {
      const pos = pendingCursorRef.current;
      inputRef.current.setSelectionRange(pos, pos);
      pendingCursorRef.current = null;
    }
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Pass through: tab, enter, escape, modifier combos
      if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.metaKey ||
        e.ctrlKey
      ) {
        return;
      }

      // Allow arrow keys, home, end to move cursor naturally
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        return;
      }

      e.preventDefault();

      if (e.key === "Backspace") {
        setState((prev) => {
          let next: CurrencyInputState;
          if (prev.decimalPart.length > 0) {
            next = { ...prev, decimalPart: prev.decimalPart.slice(0, -1) };
          } else if (prev.hasDot) {
            next = { ...prev, hasDot: false };
          } else {
            next = { ...prev, integerPart: prev.integerPart.slice(0, -1) };
          }
          const display = formatDisplay(next);
          pendingCursorRef.current = getCursorPosition(next, display);
          return next;
        });
        return;
      }

      if (e.key === "Delete") {
        const next: CurrencyInputState = {
          integerPart: "",
          decimalPart: "",
          hasDot: false,
        };
        const display = formatDisplay(next);
        pendingCursorRef.current = getCursorPosition(next, display);
        setState(next);
        return;
      }

      // Dot — switch to decimal entry
      if (e.key === "." || e.key === "Decimal") {
        setState((prev) => {
          if (prev.hasDot) return prev; // Already in decimal mode
          const next = { ...prev, hasDot: true };
          const display = formatDisplay(next);
          pendingCursorRef.current = getCursorPosition(next, display);
          return next;
        });
        return;
      }

      // Only accept digit keys
      if (/^[0-9]$/.test(e.key)) {
        const digit = e.key;

        setState((prev) => {
          if (prev.hasDot) {
            // Adding to decimal part — max 2 digits
            if (prev.decimalPart.length >= 2) return prev;
            const next = { ...prev, decimalPart: prev.decimalPart + digit };
            const display = formatDisplay(next);
            pendingCursorRef.current = getCursorPosition(next, display);
            return next;
          }

          // Adding to integer part
          const newInteger = prev.integerPart + digit;

          // Don't allow leading zeros in integer part
          const normalized = newInteger.replace(/^0+/, "") || "";
          if (normalized.length > MAX_INTEGER_DIGITS) return prev;

          // Special: if user types 0 as first digit, keep it as "0"
          if (prev.integerPart === "" && digit === "0") {
            const next = { ...prev, integerPart: "0" };
            const display = formatDisplay(next);
            pendingCursorRef.current = getCursorPosition(next, display);
            return next;
          }

          const next = { ...prev, integerPart: normalized || digit };
          const display = formatDisplay(next);
          pendingCursorRef.current = getCursorPosition(next, display);
          return next;
        });
      }
    },
    [],
  );

  const handleChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>) => {
      // No-op: all input is handled via onKeyDown to prevent unmasked input
    },
    [],
  );

  const setFromPreset = useCallback((dollarAmount: number) => {
    const next: CurrencyInputState = {
      integerPart: dollarAmount.toString(),
      decimalPart: "",
      hasDot: false,
    };
    const display = formatDisplay(next);
    pendingCursorRef.current = getCursorPosition(next, display);
    setState(next);
  }, []);

  const reset = useCallback((value = "") => {
    setState(parseInitialValue(value));
  }, []);

  return {
    /** The formatted display string, e.g. "1,234.56" */
    displayValue,
    /** The raw numeric string for form submission, e.g. "1234.56" */
    rawValue,
    /** Current value in cents */
    cents,
    /** Ref to attach to the input element */
    inputRef,
    /** onKeyDown handler for the input */
    handleKeyDown,
    /** onChange handler (no-op, required to avoid React warnings) */
    handleChange,
    /** Set the value from a dollar preset amount */
    setFromPreset,
    /** Reset to a new value */
    reset,
  };
}
