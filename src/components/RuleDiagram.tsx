import { useMemo } from "react";
import { diagramToSvgString } from "../shared/railroad/diagramToSvg";
import { createRuleDiagram } from "../features/grammar/javaGrammar";

export function RuleDiagram(props: { name: string }) {
  const svg = useMemo(() => {
    const diagram = createRuleDiagram(props.name);
    return diagramToSvgString(diagram);
  }, [props.name]);

  return (
    <div className="rule" id={`rule-${props.name}`}>
      <h3>{props.name}</h3>
      <div
        className="svgwrap"
        // SVG is generated locally from deterministic factories.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
