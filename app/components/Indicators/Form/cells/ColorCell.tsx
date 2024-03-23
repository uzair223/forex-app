import React from "react";
import { withJsonFormsCellProps } from "@jsonforms/react";
import { rankWith, scopeEndsWith, type CellProps, type RankedTester } from "@jsonforms/core";
import type { VanillaRendererProps } from "@jsonforms/vanilla-renderers";
import { withVanillaCellProps } from "@jsonforms/vanilla-renderers";

export const DateCell = (props: CellProps & VanillaRendererProps) => {
  const { data, className, id, enabled, uischema, path, handleChange } = props;

  return (
    <input
      type="color"
      value={data || ""}
      onChange={ev => handleChange(path, ev.target.value)}
      className={className?.replace(/ ?p(x|y)?-\d+/, "")}
      id={id}
      disabled={!enabled}
      autoFocus={uischema.options && uischema.options.focus}
    />
  );
};

export const colorCellTester: RankedTester = rankWith(2, scopeEndsWith("color"));
export default withJsonFormsCellProps(withVanillaCellProps(DateCell));
