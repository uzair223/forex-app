import { useState } from "react";
import { JsonForms } from "@jsonforms/react";

import type { JsonSchema, UISchemaElement, RankedTester } from "@jsonforms/core";
import type { IndicatorComponent } from "../componentBuilder";

import {
  JsonFormsStyleContext,
  vanillaStyles,
  vanillaCells,
  vanillaRenderers,
} from "@jsonforms/vanilla-renderers";

import ColorCell, { colorCellTester } from "./cells/ColorCell";

const styleContextValue = {
  styles: [
    ...vanillaStyles,
    {
      name: "vertical.layout",
      classNames: ["py-2"],
    },
    {
      name: "control.input",
      classNames: ["px-1", "rounded-md"],
    },
    {
      name: "control",
      classNames: ["mb-2"],
    },
    {
      name: "control.label",
      classNames: ["leading-tight", "mr-2"],
    },
    {
      name: "control.validation",
      classNames: ["text-xs"],
    },
    {
      name: "control.validation.error",
      classNames: ["text-red-600"],
    },
    {
      name: "group.label",
      classNames: ["text-sm", "text-zinc-500"],
    },
    {
      name: "group.layout",
      classNames: ["my-2"],
    },
  ],
};
const renderers: { tester: RankedTester; renderer: any }[] = [...vanillaRenderers];
const cells: { tester: RankedTester; cell: any }[] = [
  ...vanillaCells,
  { tester: colorCellTester, cell: ColorCell },
];

interface ComponentProps {
  add: <T extends IndicatorComponent>(x: T) => void;
  onAdd: () => void;
}

function formBuilder<C extends IndicatorComponent, T extends (args: any) => C>(
  build: T,
  initialArgs: Parameters<T>[0],
  schema: JsonSchema,
  uischema?: UISchemaElement,
) {
  const Component = ({ add, onAdd }: ComponentProps) => {
    const [args, setArgs] = useState(initialArgs);
    const [error, setError] = useState(false);
    return (
      <>
        <span className="font-semibold">{schema?.title ?? "Indicator"}</span>
        <JsonFormsStyleContext.Provider value={styleContextValue}>
          <JsonForms
            data={args}
            schema={schema}
            uischema={uischema}
            renderers={renderers}
            cells={cells}
            onChange={({ data, errors }) => {
              setError(!!errors?.length);
              setArgs(data);
            }}
          />
        </JsonFormsStyleContext.Provider>
        <button
          className="px-2 py-1 rounded-md text-white bg-blue-500 transition duration-500 hover:shadow-md hover:shadow-sky-400/50"
          onClick={() => {
            if (error) return;
            add(
              Object.assign(build(args), {
                build: build.name,
                buildArgs: args,
              }),
            );
            onAdd();
          }}
        >
          Add
        </button>
      </>
    );
  };
  Component.displayName = schema?.title ?? "Component";
  return Component;
}

export default formBuilder;
