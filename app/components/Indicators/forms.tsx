import formBuilder from "./Form/formBuilder";
import { buildBB, buildEMA, buildSMA } from "./indicatorBuilder";

const props = {
  type: "object",
  properties: {
    color: {
      type: "string",
    },
    strokeWidth: {
      type: "integer",
      minimum: 0,
      maximum: 4,
    },
  },
  required: ["color", "strokeWidth"],
};
const uiprops = (x?: string) => [
  {
    type: "Control",
    scope: `#/properties/props/properties/${x ? x + "/properties/" : ""}color`,
    options: { hideRequiredAsterisk: true },
  },
  {
    type: "Control",
    scope: `#/properties/props/properties/${x ? x + "/properties/" : ""}strokeWidth`,
    options: { hideRequiredAsterisk: true },
  },
];

const schema = {
  type: "object",
  properties: {
    source: {
      type: "string",
      enum: ["open", "high", "low", "close"],
    },
    length: {
      type: "integer",
      maximum: 200,
      minimum: 5,
    },
    props,
  },
  required: ["source", "length"],
};
const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/source",
      options: { hideRequiredAsterisk: true },
    },
    {
      type: "Control",
      scope: "#/properties/length",
      options: { hideRequiredAsterisk: true },
    },
    ...uiprops(),
  ],
};

const SMA = formBuilder(
  buildSMA,
  { source: "close", length: 20, props: { color: "#3b82f6", strokeWidth: 1 } },
  {
    title: "Simple Moving Average (SMA)",
    ...schema,
  },
  uischema,
);

const EMA = formBuilder(
  buildEMA,
  { source: "close", length: 20, props: { color: "#3b82f6", strokeWidth: 1 } },
  {
    title: "Exponential Moving Average (EMA)",
    ...schema,
  },
  uischema,
);

const BB = formBuilder(
  buildBB,
  {
    source: "close",
    n: 2,
    length: 20,
    props: {
      upper: { color: "#71717a", strokeWidth: 1 },
      middle: { color: "#f97316", strokeWidth: 1 },
      lower: { color: "#71717a", strokeWidth: 1 },
    },
  },
  {
    title: "Bollinger Bands (BB)",
    type: "object",
    properties: {
      source: {
        type: "string",
        enum: ["open", "high", "low", "close"],
      },
      n: {
        title: "StdDev.",
        type: "number",
        minimum: 0,
      },
      length: {
        type: "integer",
        maximum: 200,
        minimum: 5,
      },
      props: {
        type: "object",
        properties: {
          upper: props,
          middle: props,
          lower: props,
        },
      },
    },
    required: ["source", "n", "length"],
  },
  {
    type: "VerticalLayout",
    //@ts-ignore
    elements: [
      {
        type: "Control",
        scope: "#/properties/source",
        options: { hideRequiredAsterisk: true },
      },
      {
        type: "Control",
        scope: "#/properties/length",
        options: { hideRequiredAsterisk: true },
      },
      {
        type: "Control",
        scope: "#/properties/n",
        options: { hideRequiredAsterisk: true },
      },
      {
        type: "Group",
        label: "Upper band",
        elements: uiprops("upper"),
      },
      {
        type: "Group",
        label: "Middle band",
        elements: uiprops("middle"),
      },
      {
        type: "Group",
        label: "Lower band",
        elements: uiprops("lower"),
      },
    ],
  },
);
export default [SMA, EMA, BB];
