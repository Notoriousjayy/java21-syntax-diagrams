import { RuleDiagram } from "./RuleDiagram";

export function RuleList(props: { names: string[] }) {
  return (
    <>
      {props.names.map((name) => (
        <RuleDiagram key={name} name={name} />
      ))}
    </>
  );
}
