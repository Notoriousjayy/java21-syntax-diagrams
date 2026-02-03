import { useMemo } from "react";
import { diagramToSvgString } from "../shared/railroad/diagramToSvg";
import { createRuleDiagram } from "../features/grammar/java25Grammar";
import { getEbnfDefinition } from "../features/grammar/ebnfDefinitions";

interface RuleDiagramProps {
  name: string;
}

/**
 * Renders a railroad diagram for a Java 25 grammar rule,
 * along with its EBNF definition displayed below.
 * 
 * Security note: SVG is generated locally from deterministic factories.
 * No untrusted user input is processed. If external grammar loading is
 * added in the future, implement defensive sanitization.
 */
export function RuleDiagram({ name }: RuleDiagramProps) {
  const svg = useMemo(() => {
    const diagram = createRuleDiagram(name);
    return diagramToSvgString(diagram);
  }, [name]);

  const ebnf = useMemo(() => getEbnfDefinition(name), [name]);

  return (
    <div className="rule" id={`rule-${name}`}>
      <h3>{name}</h3>

      {/* Railroad Diagram */}
      <div
        className="svgwrap"
        // SVG is generated locally from deterministic factories.
        // Trust boundary: no untrusted input is processed here.
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {/* EBNF Definition */}
      {ebnf && (
        <details className="ebnf-container" open>
          <summary className="ebnf-toggle">EBNF</summary>
          <pre className="ebnf-code">{ebnf}</pre>
        </details>
      )}
    </div>
  );
}
