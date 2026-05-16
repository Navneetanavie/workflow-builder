"use client";

import { useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import type { NodeProps } from "@xyflow/react";

import { AddFieldMenu } from "@/components/workflow/nodes/add-field-menu";
import { BaseNode, FieldBlock } from "@/components/workflow/nodes/base-node";
import { NodeImageField } from "@/components/workflow/nodes/node-image-field";
import {
  labelInputClassName,
  textareaClassName,
} from "@/components/workflow/nodes/node-styles";
import type { RequestField, RequestInputsData } from "@/lib/workflow/types";

export function RequestInputsNode({ id, data }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const nodeData = data as RequestInputsData;

  const updateField = (fieldId: string, patch: Partial<RequestField>) => {
    updateNodeData(id, {
      fields: nodeData.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    });
  };

  const addField = (type: RequestField["type"]) => {
    const count = nodeData.fields.filter((f) => f.type === type).length + 1;
    const base = type === "text" ? "text_field" : "image_field";
    const name =
      count === 1 ? (type === "text" ? "Car prompt" : base) : `${base}_${count}`;
    const field: RequestField = {
      id: `${base}-${crypto.randomUUID().slice(0, 6)}`,
      name,
      type,
      value: "",
    };
    updateNodeData(id, { fields: [...nodeData.fields, field] });
  };

  const removeField = (fieldId: string) => {
    if (nodeData.fields.length <= 1) return;
    updateNodeData(id, {
      fields: nodeData.fields.filter((field) => field.id !== fieldId),
    });
  };

  return (
    <BaseNode
      title="Request-Inputs"
      headerRight={
        <AddFieldMenu
          onAddText={() => addField("text")}
          onAddImage={() => addField("image")}
        />
      }
    >
      {nodeData.fields.map((field) => (
        <FieldBlock
          key={field.id}
          label={
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField(field.id, { name: e.target.value })}
              className={labelInputClassName}
            />
          }
          headerRight={
            <button
              type="button"
              onClick={() => removeField(field.id)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              aria-label={`Delete ${field.name}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          }
          port={{
            id: `out-${field.id}`,
            type: "source",
            dataType: field.type === "image" ? "image" : "text",
          }}
        >
          {field.type === "text" ? (
            <textarea
              value={field.value}
              onChange={(e) => updateField(field.id, { value: e.target.value })}
              rows={3}
              className={textareaClassName}
              placeholder="Enter text..."
            />
          ) : (
            <NodeImageField
              value={field.value}
              alt={field.name}
              onChange={(url) => updateField(field.id, { value: url })}
            />
          )}
        </FieldBlock>
      ))}
    </BaseNode>
  );
}
