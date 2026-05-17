"use client";

import { ChevronRight, RotateCcw } from "lucide-react";

import { inputClassName, textareaClassName } from "@/components/workflow/nodes/node-styles";
import type { GeminiSettings } from "@/lib/workflow/types";

type GeminiSettingsPanelProps = {
  open: boolean;
  settings: GeminiSettings;
  onToggle: () => void;
  onChange: (patch: Partial<GeminiSettings>) => void;
};

function SliderField({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-700">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          <span className="tabular-nums text-gray-900">{value}</span>
          <button
            type="button"
            onClick={() => onChange(min)}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100"
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-blue-600"
      />
    </div>
  );
}

export function GeminiSettingsPanel({
  open,
  settings,
  onToggle,
  onChange,
}: GeminiSettingsPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 workflow-settings-panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-800"
      >
        Settings
        <ChevronRight
          className={`size-4 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 px-3 py-3">
          <SliderField
            label="Temperature"
            value={settings.temperature}
            onChange={(v) => onChange({ temperature: v })}
          />
          <div className="space-y-1">
            <label className="text-xs text-gray-700">Max Tokens</label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={(e) =>
                onChange({ maxTokens: Number(e.target.value) })
              }
              className={inputClassName}
            />
          </div>
          <SliderField
            label="Top P"
            value={settings.topP}
            onChange={(v) => onChange({ topP: v })}
          />
          <SliderField
            label="Top K"
            value={settings.topK}
            min={0}
            max={100}
            step={1}
            onChange={(v) => onChange({ topK: v })}
          />
          <SliderField
            label="Frequency Penalty"
            value={settings.frequencyPenalty}
            onChange={(v) => onChange({ frequencyPenalty: v })}
          />
          <SliderField
            label="Presence Penalty"
            value={settings.presencePenalty}
            onChange={(v) => onChange({ presencePenalty: v })}
          />
          <SliderField
            label="Repetition Penalty"
            value={settings.repetitionPenalty}
            onChange={(v) => onChange({ repetitionPenalty: v })}
          />
          <SliderField
            label="Min P"
            value={settings.minP}
            onChange={(v) => onChange({ minP: v })}
          />
          <SliderField
            label="Top A"
            value={settings.topA}
            onChange={(v) => onChange({ topA: v })}
          />
          <div className="space-y-1">
            <label className="text-xs text-gray-700">Seed</label>
            <input
              type="number"
              value={settings.seed}
              onChange={(e) => onChange({ seed: Number(e.target.value) })}
              className={inputClassName}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">Reasoning</span>
            <button
              type="button"
              onClick={() => onChange({ reasoning: !settings.reasoning })}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                settings.reasoning
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {settings.reasoning ? "True" : "False"}
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-700">Stop Sequences</label>
            <textarea
              value={settings.stopSequences}
              onChange={(e) => onChange({ stopSequences: e.target.value })}
              placeholder="e.g. END, STOP, ###"
              rows={2}
              className={textareaClassName}
            />
          </div>
        </div>
      )}
    </div>
  );
}
