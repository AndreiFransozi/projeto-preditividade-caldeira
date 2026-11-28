"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import FieldError from "@/components/ui/FieldError";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownMenuProps {
  id?: string;
  labelledBy?: string;
  buttonText: string;
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function DropdownMenu({
  id: externalId,
  labelledBy,
  buttonText,
  options,
  value,
  onSelect,
  actionLabel,
  onAction,
  disabled = false,
  required = false,
  error,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const triggerId = externalId ?? `dropdown-trigger-${id}`;
  const menuId = `dropdown-menu-${id}`;
  const errorId = `dropdown-error-${id}`;

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !wrapperRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const lastIndex = itemRefs.current.length - 1;
    const currentIndex = itemRefs.current.findIndex(
      (item) => item === event.target
    );
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = lastIndex;
    else if (event.key === "ArrowDown") {
      nextIndex = currentIndex < lastIndex ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : lastIndex;
    }

    itemRefs.current[nextIndex]?.focus();
  }

  function chooseOption(optionValue: string) {
    onSelect(optionValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const itemClassName =
    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800 focus-visible:bg-slate-800 focus-visible:outline-none";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border bg-slate-900 px-4 py-3 text-left text-sm text-slate-100 outline-none transition focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-rose-400" : "border-slate-600 hover:border-slate-400"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${triggerId}` : undefined}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={value ? "" : "text-slate-400"}>{buttonText}</span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.09 1.032l-4.25 4.51a.75.75 0 0 1-1.09 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl shadow-black/40"
          onKeyDown={moveFocus}
        >
          {options.map((option, index) => (
            <button
              key={option.value || `option-${index}`}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitem"
              className={itemClassName}
              onClick={() => chooseOption(option.value)}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <span aria-hidden="true" className="text-sky-300">
                  ✓
                </span>
              )}
            </button>
          ))}

          {actionLabel && onAction && (
            <>
              <div role="separator" className="my-1.5 border-t border-slate-700" />
              <button
                ref={(element) => {
                  itemRefs.current[options.length] = element;
                }}
                type="button"
                role="menuitem"
                className={`${itemClassName} font-medium text-sky-300 hover:text-sky-200`}
                onClick={() => {
                  setOpen(false);
                  onAction();
                }}
              >
                {actionLabel}
              </button>
            </>
          )}
        </div>
      )}

      <FieldError id={errorId} message={error} />
    </div>
  );
}
