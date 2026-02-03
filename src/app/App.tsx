import { useMemo, useState, useCallback } from "react";
import { RuleList } from "../components/RuleList";
import { SECTION_ORDER, SECTION_RULES, SECTION_TITLES, type SectionId } from "../features/grammar/java25Grammar";

export default function App() {
  const [query, setQuery] = useState("");
  
  // Track which sections are expanded (lazy rendering: collapsed by default for performance)
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(() => {
    // Start with first section expanded for better UX
    return new Set([SECTION_ORDER[0]]);
  });

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSections(new Set(SECTION_ORDER));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  const filterNames = (names: string[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return names;
    return names.filter((n) => n.toLowerCase().includes(q));
  };

  const filteredBySection: Record<SectionId, string[]> = useMemo(() => {
    const out = {} as Record<SectionId, string[]>;
    for (const s of SECTION_ORDER) out[s] = filterNames(SECTION_RULES[s]);
    return out;
  }, [query]);

  // When filtering, auto-expand sections that have matches
  const hasFilterQuery = query.trim().length > 0;

  return (
    <>
      <header>
        <h1 style={{ margin: 0 }}>Java 25 Language Syntax – Railroad Diagrams</h1>
        <div className="subtitle">
          Rendered from a diagram-friendly transcription of JLS Chapter 19 grammar rules (left recursion removed where needed).
        </div>

        <div className="toolbar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter rules by name (e.g., ClassDeclaration, Expression)…"
            aria-label="Filter rules"
          />
          <div className="toolbar-actions">
            <button type="button" onClick={expandAll} className="toolbar-btn">
              Expand All
            </button>
            <button type="button" onClick={collapseAll} className="toolbar-btn">
              Collapse All
            </button>
          </div>
        </div>

        <nav>
          {SECTION_ORDER.map((s) => (
            <a key={s} href={`#${s}`}>
              {SECTION_TITLES[s]}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {SECTION_ORDER.map((s) => {
          const ruleCount = filteredBySection[s].length;
          const isExpanded = hasFilterQuery ? ruleCount > 0 : expandedSections.has(s);
          
          // Skip rendering empty sections when filtering
          if (hasFilterQuery && ruleCount === 0) return null;

          return (
            <section key={s} id={s} className="grammar-section">
              <button
                type="button"
                className="section-header"
                onClick={() => toggleSection(s)}
                aria-expanded={isExpanded}
                aria-controls={`section-content-${s}`}
              >
                <span className={`section-chevron ${isExpanded ? 'expanded' : ''}`}>▶</span>
                <h2>{SECTION_TITLES[s]}</h2>
                <span className="rule-count">({ruleCount} rules)</span>
              </button>
              
              {/* Lazy render: only render rules when section is expanded */}
              {isExpanded && (
                <div id={`section-content-${s}`} className="section-content">
                  <RuleList names={filteredBySection[s]} />
                </div>
              )}
            </section>
          );
        })}
      </main>

      <footer>
        <div>
          Tip: Use <code>npm run dev</code> for local development, or <code>npm run build</code> then <code>npm run preview</code> to serve a production build.
        </div>
      </footer>
    </>
  );
}
