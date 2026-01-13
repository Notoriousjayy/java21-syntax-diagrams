// java-syntax-diagrams.ts
//
// ES module that defines the Java Language Specification (Chapter 19) grammar as railroad diagrams.
// Based on JLS SE 21 syntax. Many rules are rendered in diagram-friendly equivalent form 
// (e.g., left recursion -> repetition).

import * as RR from "@prantlf/railroad-diagrams/lib/index.mjs";

// Convenience wrappers ------------------------------------------------------
//
// The @prantlf/railroad-diagrams package has shipped in builds where the exported
// primitives are factory functions and builds where they are ES class constructors.
// Calling a class constructor without `new` throws:
//   "Class constructor X cannot be invoked without 'new'"
//
// `callOrNew` lets us treat everything as a callable, regardless of how it is exported.
function callOrNew(Ctor: any, ...args: any[]): any {
  try {
    return Ctor(...args);
  } catch (e: any) {
    if (e instanceof TypeError && /without 'new'/.test(e.message)) {
      return new Ctor(...args);
    }
    throw e;
  }
}

// Wrapped primitives (use these throughout the file)
const Diagram    = (...a: any[]) => callOrNew(RR.Diagram, ...a);
const Sequence   = (...a: any[]) => callOrNew(RR.Sequence, ...a);
const Choice     = (...a: any[]) => callOrNew(RR.Choice, ...a);
const Optional   = (...a: any[]) => callOrNew(RR.Optional, ...a);
const OneOrMore  = (...a: any[]) => callOrNew(RR.OneOrMore, ...a);
const ZeroOrMore = (...a: any[]) => callOrNew(RR.ZeroOrMore, ...a);
const Terminal   = (...a: any[]) => callOrNew(RR.Terminal, ...a);
const NonTerminal = (...a: any[]) => callOrNew(RR.NonTerminal, ...a);
const Stack      = (...a: any[]) => callOrNew(RR.Stack, ...a);
const Comment    = (...a: any[]) => callOrNew(RR.Comment, ...a);

const T  = (s: string) => Terminal(s);
const NT = (s: string) => NonTerminal(s);

// --- Grammar rules (diagram factories) ----------------------------------------

const rules = new Map<string, () => any>();

// ===== §3 Lexical Structure =====

rules.set("Identifier", () =>
  Diagram(
    Sequence(
      NT("IdentifierChars"),
      Comment("but not ReservedKeyword, BooleanLiteral, or NullLiteral")
    )
  )
);

rules.set("IdentifierChars", () =>
  Diagram(
    Sequence(
      NT("JavaLetter"),
      ZeroOrMore(NT("JavaLetterOrDigit"))
    )
  )
);

rules.set("JavaLetter", () =>
  Diagram(Comment("any Unicode character that is a 'Java letter'"))
);

rules.set("JavaLetterOrDigit", () =>
  Diagram(Comment("any Unicode character that is a 'Java letter-or-digit'"))
);

rules.set("TypeIdentifier", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      Comment("but not permits, record, sealed, var, or yield")
    )
  )
);

rules.set("UnqualifiedMethodIdentifier", () =>
  Diagram(
    Sequence(NT("Identifier"), Comment("but not yield"))
  )
);

rules.set("Literal", () =>
  Diagram(
    Choice(0,
      NT("IntegerLiteral"),
      NT("FloatingPointLiteral"),
      NT("BooleanLiteral"),
      NT("CharacterLiteral"),
      NT("StringLiteral"),
      NT("TextBlock"),
      NT("NullLiteral")
    )
  )
);

// ===== §4 Types, Values, and Variables =====

rules.set("Type", () =>
  Diagram(
    Choice(0, NT("PrimitiveType"), NT("ReferenceType"))
  )
);

rules.set("PrimitiveType", () =>
  Diagram(
    Choice(0,
      Sequence(ZeroOrMore(NT("Annotation")), NT("NumericType")),
      Sequence(ZeroOrMore(NT("Annotation")), T("boolean"))
    )
  )
);

rules.set("NumericType", () =>
  Diagram(
    Choice(0, NT("IntegralType"), NT("FloatingPointType"))
  )
);

rules.set("IntegralType", () =>
  Diagram(
    Choice(0, T("byte"), T("short"), T("int"), T("long"), T("char"))
  )
);

rules.set("FloatingPointType", () =>
  Diagram(Choice(0, T("float"), T("double")))
);

rules.set("ReferenceType", () =>
  Diagram(
    Choice(0,
      NT("ClassOrInterfaceType"),
      NT("TypeVariable"),
      NT("ArrayType")
    )
  )
);

rules.set("ClassOrInterfaceType", () =>
  Diagram(Choice(0, NT("ClassType"), NT("InterfaceType")))
);

rules.set("ClassType", () =>
  Diagram(
    Choice(0,
      Sequence(
        ZeroOrMore(NT("Annotation")),
        NT("TypeIdentifier"),
        Optional(NT("TypeArguments"))
      ),
      Sequence(
        NT("PackageName"), T("."),
        ZeroOrMore(NT("Annotation")),
        NT("TypeIdentifier"),
        Optional(NT("TypeArguments"))
      ),
      Sequence(
        NT("ClassOrInterfaceType"), T("."),
        ZeroOrMore(NT("Annotation")),
        NT("TypeIdentifier"),
        Optional(NT("TypeArguments"))
      )
    )
  )
);

rules.set("InterfaceType", () =>
  Diagram(NT("ClassType"))
);

rules.set("TypeVariable", () =>
  Diagram(
    Sequence(ZeroOrMore(NT("Annotation")), NT("TypeIdentifier"))
  )
);

rules.set("ArrayType", () =>
  Diagram(
    Choice(0,
      Sequence(NT("PrimitiveType"), NT("Dims")),
      Sequence(NT("ClassOrInterfaceType"), NT("Dims")),
      Sequence(NT("TypeVariable"), NT("Dims"))
    )
  )
);

rules.set("Dims", () =>
  Diagram(
    OneOrMore(
      Sequence(ZeroOrMore(NT("Annotation")), T("["), T("]"))
    )
  )
);

rules.set("TypeParameter", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("TypeParameterModifier")),
      NT("TypeIdentifier"),
      Optional(NT("TypeBound"))
    )
  )
);

rules.set("TypeParameterModifier", () =>
  Diagram(NT("Annotation"))
);

rules.set("TypeBound", () =>
  Diagram(
    Choice(0,
      Sequence(T("extends"), NT("TypeVariable")),
      Sequence(T("extends"), NT("ClassOrInterfaceType"), ZeroOrMore(NT("AdditionalBound")))
    )
  )
);

rules.set("AdditionalBound", () =>
  Diagram(Sequence(T("&"), NT("InterfaceType")))
);

rules.set("TypeArguments", () =>
  Diagram(Sequence(T("<"), NT("TypeArgumentList"), T(">")))
);

rules.set("TypeArgumentList", () =>
  Diagram(
    Sequence(
      NT("TypeArgument"),
      ZeroOrMore(Sequence(T(","), NT("TypeArgument")))
    )
  )
);

rules.set("TypeArgument", () =>
  Diagram(Choice(0, NT("ReferenceType"), NT("Wildcard")))
);

rules.set("Wildcard", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("Annotation")),
      T("?"),
      Optional(NT("WildcardBounds"))
    )
  )
);

rules.set("WildcardBounds", () =>
  Diagram(
    Choice(0,
      Sequence(T("extends"), NT("ReferenceType")),
      Sequence(T("super"), NT("ReferenceType"))
    )
  )
);

// ===== §6 Names =====

rules.set("ModuleName", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), NT("Identifier")))
    )
  )
);

rules.set("PackageName", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), NT("Identifier")))
    )
  )
);

rules.set("TypeName", () =>
  Diagram(
    Choice(0,
      NT("TypeIdentifier"),
      Sequence(NT("PackageOrTypeName"), T("."), NT("TypeIdentifier"))
    )
  )
);

rules.set("ExpressionName", () =>
  Diagram(
    Choice(0,
      NT("Identifier"),
      Sequence(NT("AmbiguousName"), T("."), NT("Identifier"))
    )
  )
);

rules.set("MethodName", () =>
  Diagram(NT("UnqualifiedMethodIdentifier"))
);

rules.set("PackageOrTypeName", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), NT("Identifier")))
    )
  )
);

rules.set("AmbiguousName", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), NT("Identifier")))
    )
  )
);

// ===== §7 Packages and Modules =====

rules.set("CompilationUnit", () =>
  Diagram(
    Choice(0,
      NT("OrdinaryCompilationUnit"),
      NT("ModularCompilationUnit")
    )
  )
);

rules.set("OrdinaryCompilationUnit", () =>
  Diagram(
    Sequence(
      Optional(NT("PackageDeclaration")),
      ZeroOrMore(NT("ImportDeclaration")),
      ZeroOrMore(NT("TopLevelClassOrInterfaceDeclaration"))
    )
  )
);

rules.set("ModularCompilationUnit", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ImportDeclaration")),
      NT("ModuleDeclaration")
    )
  )
);

rules.set("PackageDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("PackageModifier")),
      T("package"),
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), NT("Identifier"))),
      T(";")
    )
  )
);

rules.set("PackageModifier", () =>
  Diagram(NT("Annotation"))
);

rules.set("ImportDeclaration", () =>
  Diagram(
    Choice(0,
      NT("SingleTypeImportDeclaration"),
      NT("TypeImportOnDemandDeclaration"),
      NT("SingleStaticImportDeclaration"),
      NT("StaticImportOnDemandDeclaration")
    )
  )
);

rules.set("SingleTypeImportDeclaration", () =>
  Diagram(Sequence(T("import"), NT("TypeName"), T(";")))
);

rules.set("TypeImportOnDemandDeclaration", () =>
  Diagram(Sequence(T("import"), NT("PackageOrTypeName"), T("."), T("*"), T(";")))
);

rules.set("SingleStaticImportDeclaration", () =>
  Diagram(Sequence(T("import"), T("static"), NT("TypeName"), T("."), NT("Identifier"), T(";")))
);

rules.set("StaticImportOnDemandDeclaration", () =>
  Diagram(Sequence(T("import"), T("static"), NT("TypeName"), T("."), T("*"), T(";")))
);

rules.set("TopLevelClassOrInterfaceDeclaration", () =>
  Diagram(
    Choice(0,
      NT("ClassDeclaration"),
      NT("InterfaceDeclaration"),
      T(";")
    )
  )
);

rules.set("ModuleDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("Annotation")),
      Optional(T("open")),
      T("module"),
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), NT("Identifier"))),
      T("{"),
      ZeroOrMore(NT("ModuleDirective")),
      T("}")
    )
  )
);

rules.set("ModuleDirective", () =>
  Diagram(
    Choice(0,
      Sequence(T("requires"), ZeroOrMore(NT("RequiresModifier")), NT("ModuleName"), T(";")),
      Sequence(T("exports"), NT("PackageName"), Optional(Sequence(T("to"), NT("ModuleName"), ZeroOrMore(Sequence(T(","), NT("ModuleName"))))), T(";")),
      Sequence(T("opens"), NT("PackageName"), Optional(Sequence(T("to"), NT("ModuleName"), ZeroOrMore(Sequence(T(","), NT("ModuleName"))))), T(";")),
      Sequence(T("uses"), NT("TypeName"), T(";")),
      Sequence(T("provides"), NT("TypeName"), T("with"), NT("TypeName"), ZeroOrMore(Sequence(T(","), NT("TypeName"))), T(";"))
    )
  )
);

rules.set("RequiresModifier", () =>
  Diagram(Choice(0, T("transitive"), T("static")))
);

// ===== §8 Classes =====

rules.set("ClassDeclaration", () =>
  Diagram(
    Choice(0,
      NT("NormalClassDeclaration"),
      NT("EnumDeclaration"),
      NT("RecordDeclaration")
    )
  )
);

rules.set("NormalClassDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ClassModifier")),
      T("class"),
      NT("TypeIdentifier"),
      Optional(NT("TypeParameters")),
      Optional(NT("ClassExtends")),
      Optional(NT("ClassImplements")),
      Optional(NT("ClassPermits")),
      NT("ClassBody")
    )
  )
);

rules.set("ClassModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("protected"), T("private"),
      T("abstract"), T("static"), T("final"),
      T("sealed"), T("non-sealed"), T("strictfp")
    )
  )
);

rules.set("TypeParameters", () =>
  Diagram(Sequence(T("<"), NT("TypeParameterList"), T(">")))
);

rules.set("TypeParameterList", () =>
  Diagram(
    Sequence(
      NT("TypeParameter"),
      ZeroOrMore(Sequence(T(","), NT("TypeParameter")))
    )
  )
);

rules.set("ClassExtends", () =>
  Diagram(Sequence(T("extends"), NT("ClassType")))
);

rules.set("ClassImplements", () =>
  Diagram(Sequence(T("implements"), NT("InterfaceTypeList")))
);

rules.set("InterfaceTypeList", () =>
  Diagram(
    Sequence(
      NT("InterfaceType"),
      ZeroOrMore(Sequence(T(","), NT("InterfaceType")))
    )
  )
);

rules.set("ClassPermits", () =>
  Diagram(
    Sequence(
      T("permits"),
      NT("TypeName"),
      ZeroOrMore(Sequence(T(","), NT("TypeName")))
    )
  )
);

rules.set("ClassBody", () =>
  Diagram(
    Sequence(T("{"), ZeroOrMore(NT("ClassBodyDeclaration")), T("}"))
  )
);

rules.set("ClassBodyDeclaration", () =>
  Diagram(
    Choice(0,
      NT("ClassMemberDeclaration"),
      NT("InstanceInitializer"),
      NT("StaticInitializer"),
      NT("ConstructorDeclaration")
    )
  )
);

rules.set("ClassMemberDeclaration", () =>
  Diagram(
    Choice(0,
      NT("FieldDeclaration"),
      NT("MethodDeclaration"),
      NT("ClassDeclaration"),
      NT("InterfaceDeclaration"),
      T(";")
    )
  )
);

rules.set("FieldDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("FieldModifier")),
      NT("UnannType"),
      NT("VariableDeclaratorList"),
      T(";")
    )
  )
);

rules.set("FieldModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("protected"), T("private"),
      T("static"), T("final"), T("transient"), T("volatile")
    )
  )
);

rules.set("VariableDeclaratorList", () =>
  Diagram(
    Sequence(
      NT("VariableDeclarator"),
      ZeroOrMore(Sequence(T(","), NT("VariableDeclarator")))
    )
  )
);

rules.set("VariableDeclarator", () =>
  Diagram(
    Sequence(
      NT("VariableDeclaratorId"),
      Optional(Sequence(T("="), NT("VariableInitializer")))
    )
  )
);

rules.set("VariableDeclaratorId", () =>
  Diagram(
    Choice(0,
      Sequence(NT("Identifier"), Optional(NT("Dims"))),
      T("_")
    )
  )
);

rules.set("VariableInitializer", () =>
  Diagram(Choice(0, NT("Expression"), NT("ArrayInitializer")))
);

rules.set("UnannType", () =>
  Diagram(Choice(0, NT("UnannPrimitiveType"), NT("UnannReferenceType")))
);

rules.set("UnannPrimitiveType", () =>
  Diagram(Choice(0, NT("NumericType"), T("boolean")))
);

rules.set("UnannReferenceType", () =>
  Diagram(
    Choice(0,
      NT("UnannClassOrInterfaceType"),
      NT("UnannTypeVariable"),
      NT("UnannArrayType")
    )
  )
);

rules.set("UnannClassOrInterfaceType", () =>
  Diagram(Choice(0, NT("UnannClassType"), NT("UnannInterfaceType")))
);

rules.set("UnannClassType", () =>
  Diagram(
    Choice(0,
      Sequence(NT("TypeIdentifier"), Optional(NT("TypeArguments"))),
      Sequence(NT("PackageName"), T("."), ZeroOrMore(NT("Annotation")), NT("TypeIdentifier"), Optional(NT("TypeArguments"))),
      Sequence(NT("UnannClassOrInterfaceType"), T("."), ZeroOrMore(NT("Annotation")), NT("TypeIdentifier"), Optional(NT("TypeArguments")))
    )
  )
);

rules.set("UnannInterfaceType", () =>
  Diagram(NT("UnannClassType"))
);

rules.set("UnannTypeVariable", () =>
  Diagram(NT("TypeIdentifier"))
);

rules.set("UnannArrayType", () =>
  Diagram(
    Choice(0,
      Sequence(NT("UnannPrimitiveType"), NT("Dims")),
      Sequence(NT("UnannClassOrInterfaceType"), NT("Dims")),
      Sequence(NT("UnannTypeVariable"), NT("Dims"))
    )
  )
);

rules.set("MethodDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("MethodModifier")),
      NT("MethodHeader"),
      NT("MethodBody")
    )
  )
);

rules.set("MethodModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("protected"), T("private"),
      T("abstract"), T("static"), T("final"),
      T("synchronized"), T("native"), T("strictfp")
    )
  )
);

rules.set("MethodHeader", () =>
  Diagram(
    Choice(0,
      Sequence(NT("Result"), NT("MethodDeclarator"), Optional(NT("Throws"))),
      Sequence(NT("TypeParameters"), ZeroOrMore(NT("Annotation")), NT("Result"), NT("MethodDeclarator"), Optional(NT("Throws")))
    )
  )
);

rules.set("Result", () =>
  Diagram(Choice(0, NT("UnannType"), T("void")))
);

rules.set("MethodDeclarator", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      T("("),
      Optional(Sequence(NT("ReceiverParameter"), T(","))),
      Optional(NT("FormalParameterList")),
      T(")"),
      Optional(NT("Dims"))
    )
  )
);

rules.set("ReceiverParameter", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("Annotation")),
      NT("UnannType"),
      Optional(Sequence(NT("Identifier"), T("."))),
      T("this")
    )
  )
);

rules.set("FormalParameterList", () =>
  Diagram(
    Sequence(
      NT("FormalParameter"),
      ZeroOrMore(Sequence(T(","), NT("FormalParameter")))
    )
  )
);

rules.set("FormalParameter", () =>
  Diagram(
    Choice(0,
      Sequence(ZeroOrMore(NT("VariableModifier")), NT("UnannType"), NT("VariableDeclaratorId")),
      NT("VariableArityParameter")
    )
  )
);

rules.set("VariableArityParameter", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("VariableModifier")),
      NT("UnannType"),
      ZeroOrMore(NT("Annotation")),
      T("..."),
      NT("Identifier")
    )
  )
);

rules.set("VariableModifier", () =>
  Diagram(Choice(0, NT("Annotation"), T("final")))
);

rules.set("Throws", () =>
  Diagram(Sequence(T("throws"), NT("ExceptionTypeList")))
);

rules.set("ExceptionTypeList", () =>
  Diagram(
    Sequence(
      NT("ExceptionType"),
      ZeroOrMore(Sequence(T(","), NT("ExceptionType")))
    )
  )
);

rules.set("ExceptionType", () =>
  Diagram(Choice(0, NT("ClassType"), NT("TypeVariable")))
);

rules.set("MethodBody", () =>
  Diagram(Choice(0, NT("Block"), T(";")))
);

rules.set("InstanceInitializer", () =>
  Diagram(NT("Block"))
);

rules.set("StaticInitializer", () =>
  Diagram(Sequence(T("static"), NT("Block")))
);

rules.set("ConstructorDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ConstructorModifier")),
      NT("ConstructorDeclarator"),
      Optional(NT("Throws")),
      NT("ConstructorBody")
    )
  )
);

rules.set("ConstructorModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("protected"), T("private")
    )
  )
);

rules.set("ConstructorDeclarator", () =>
  Diagram(
    Sequence(
      Optional(NT("TypeParameters")),
      NT("SimpleTypeName"),
      T("("),
      Optional(Sequence(NT("ReceiverParameter"), T(","))),
      Optional(NT("FormalParameterList")),
      T(")")
    )
  )
);

rules.set("SimpleTypeName", () =>
  Diagram(NT("TypeIdentifier"))
);

rules.set("ConstructorBody", () =>
  Diagram(
    Choice(0,
      Sequence(T("{"), Optional(NT("BlockStatements")), NT("ConstructorInvocation"), Optional(NT("BlockStatements")), T("}")),
      Sequence(T("{"), Optional(NT("BlockStatements")), T("}"))
    )
  )
);

rules.set("ConstructorInvocation", () =>
  Diagram(
    Choice(0,
      Sequence(Optional(NT("TypeArguments")), T("this"), T("("), Optional(NT("ArgumentList")), T(")"), T(";")),
      Sequence(Optional(NT("TypeArguments")), T("super"), T("("), Optional(NT("ArgumentList")), T(")"), T(";")),
      Sequence(NT("ExpressionName"), T("."), Optional(NT("TypeArguments")), T("super"), T("("), Optional(NT("ArgumentList")), T(")"), T(";")),
      Sequence(NT("Primary"), T("."), Optional(NT("TypeArguments")), T("super"), T("("), Optional(NT("ArgumentList")), T(")"), T(";"))
    )
  )
);

rules.set("EnumDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ClassModifier")),
      T("enum"),
      NT("TypeIdentifier"),
      Optional(NT("ClassImplements")),
      NT("EnumBody")
    )
  )
);

rules.set("EnumBody", () =>
  Diagram(
    Sequence(
      T("{"),
      Optional(NT("EnumConstantList")),
      Optional(T(",")),
      Optional(NT("EnumBodyDeclarations")),
      T("}")
    )
  )
);

rules.set("EnumConstantList", () =>
  Diagram(
    Sequence(
      NT("EnumConstant"),
      ZeroOrMore(Sequence(T(","), NT("EnumConstant")))
    )
  )
);

rules.set("EnumConstant", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("EnumConstantModifier")),
      NT("Identifier"),
      Optional(Sequence(T("("), Optional(NT("ArgumentList")), T(")"))),
      Optional(NT("ClassBody"))
    )
  )
);

rules.set("EnumConstantModifier", () =>
  Diagram(NT("Annotation"))
);

rules.set("EnumBodyDeclarations", () =>
  Diagram(Sequence(T(";"), ZeroOrMore(NT("ClassBodyDeclaration"))))
);

rules.set("RecordDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ClassModifier")),
      T("record"),
      NT("TypeIdentifier"),
      Optional(NT("TypeParameters")),
      NT("RecordHeader"),
      Optional(NT("ClassImplements")),
      NT("RecordBody")
    )
  )
);

rules.set("RecordHeader", () =>
  Diagram(Sequence(T("("), Optional(NT("RecordComponentList")), T(")")))
);

rules.set("RecordComponentList", () =>
  Diagram(
    Sequence(
      NT("RecordComponent"),
      ZeroOrMore(Sequence(T(","), NT("RecordComponent")))
    )
  )
);

rules.set("RecordComponent", () =>
  Diagram(
    Choice(0,
      Sequence(ZeroOrMore(NT("RecordComponentModifier")), NT("UnannType"), NT("Identifier")),
      NT("VariableArityRecordComponent")
    )
  )
);

rules.set("VariableArityRecordComponent", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("RecordComponentModifier")),
      NT("UnannType"),
      ZeroOrMore(NT("Annotation")),
      T("..."),
      NT("Identifier")
    )
  )
);

rules.set("RecordComponentModifier", () =>
  Diagram(NT("Annotation"))
);

rules.set("RecordBody", () =>
  Diagram(Sequence(T("{"), ZeroOrMore(NT("RecordBodyDeclaration")), T("}")))
);

rules.set("RecordBodyDeclaration", () =>
  Diagram(
    Choice(0,
      NT("ClassBodyDeclaration"),
      NT("CompactConstructorDeclaration")
    )
  )
);

rules.set("CompactConstructorDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ConstructorModifier")),
      NT("SimpleTypeName"),
      NT("ConstructorBody")
    )
  )
);

// ===== §9 Interfaces =====

rules.set("InterfaceDeclaration", () =>
  Diagram(
    Choice(0,
      NT("NormalInterfaceDeclaration"),
      NT("AnnotationInterfaceDeclaration")
    )
  )
);

rules.set("NormalInterfaceDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("InterfaceModifier")),
      T("interface"),
      NT("TypeIdentifier"),
      Optional(NT("TypeParameters")),
      Optional(NT("InterfaceExtends")),
      Optional(NT("InterfacePermits")),
      NT("InterfaceBody")
    )
  )
);

rules.set("InterfaceModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("protected"), T("private"),
      T("abstract"), T("static"), T("sealed"), T("non-sealed"), T("strictfp")
    )
  )
);

rules.set("InterfaceExtends", () =>
  Diagram(Sequence(T("extends"), NT("InterfaceTypeList")))
);

rules.set("InterfacePermits", () =>
  Diagram(
    Sequence(
      T("permits"),
      NT("TypeName"),
      ZeroOrMore(Sequence(T(","), NT("TypeName")))
    )
  )
);

rules.set("InterfaceBody", () =>
  Diagram(Sequence(T("{"), ZeroOrMore(NT("InterfaceMemberDeclaration")), T("}")))
);

rules.set("InterfaceMemberDeclaration", () =>
  Diagram(
    Choice(0,
      NT("ConstantDeclaration"),
      NT("InterfaceMethodDeclaration"),
      NT("ClassDeclaration"),
      NT("InterfaceDeclaration"),
      T(";")
    )
  )
);

rules.set("ConstantDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("ConstantModifier")),
      NT("UnannType"),
      NT("VariableDeclaratorList"),
      T(";")
    )
  )
);

rules.set("ConstantModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("static"), T("final")
    )
  )
);

rules.set("InterfaceMethodDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("InterfaceMethodModifier")),
      NT("MethodHeader"),
      NT("MethodBody")
    )
  )
);

rules.set("InterfaceMethodModifier", () =>
  Diagram(
    Choice(0,
      NT("Annotation"),
      T("public"), T("private"),
      T("abstract"), T("default"), T("static"), T("strictfp")
    )
  )
);

rules.set("AnnotationInterfaceDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("InterfaceModifier")),
      T("@"),
      T("interface"),
      NT("TypeIdentifier"),
      NT("AnnotationInterfaceBody")
    )
  )
);

rules.set("AnnotationInterfaceBody", () =>
  Diagram(Sequence(T("{"), ZeroOrMore(NT("AnnotationInterfaceMemberDeclaration")), T("}")))
);

rules.set("AnnotationInterfaceMemberDeclaration", () =>
  Diagram(
    Choice(0,
      NT("AnnotationInterfaceElementDeclaration"),
      NT("ConstantDeclaration"),
      NT("ClassDeclaration"),
      NT("InterfaceDeclaration"),
      T(";")
    )
  )
);

rules.set("AnnotationInterfaceElementDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("AnnotationInterfaceElementModifier")),
      NT("UnannType"),
      NT("Identifier"),
      T("("),
      T(")"),
      Optional(NT("Dims")),
      Optional(NT("DefaultValue")),
      T(";")
    )
  )
);

rules.set("AnnotationInterfaceElementModifier", () =>
  Diagram(Choice(0, NT("Annotation"), T("public"), T("abstract")))
);

rules.set("DefaultValue", () =>
  Diagram(Sequence(T("default"), NT("ElementValue")))
);

rules.set("Annotation", () =>
  Diagram(
    Choice(0,
      NT("NormalAnnotation"),
      NT("MarkerAnnotation"),
      NT("SingleElementAnnotation")
    )
  )
);

rules.set("NormalAnnotation", () =>
  Diagram(
    Sequence(
      T("@"),
      NT("TypeName"),
      T("("),
      Optional(NT("ElementValuePairList")),
      T(")")
    )
  )
);

rules.set("ElementValuePairList", () =>
  Diagram(
    Sequence(
      NT("ElementValuePair"),
      ZeroOrMore(Sequence(T(","), NT("ElementValuePair")))
    )
  )
);

rules.set("ElementValuePair", () =>
  Diagram(Sequence(NT("Identifier"), T("="), NT("ElementValue")))
);

rules.set("ElementValue", () =>
  Diagram(
    Choice(0,
      NT("ConditionalExpression"),
      NT("ElementValueArrayInitializer"),
      NT("Annotation")
    )
  )
);

rules.set("ElementValueArrayInitializer", () =>
  Diagram(
    Sequence(
      T("{"),
      Optional(NT("ElementValueList")),
      Optional(T(",")),
      T("}")
    )
  )
);

rules.set("ElementValueList", () =>
  Diagram(
    Sequence(
      NT("ElementValue"),
      ZeroOrMore(Sequence(T(","), NT("ElementValue")))
    )
  )
);

rules.set("MarkerAnnotation", () =>
  Diagram(Sequence(T("@"), NT("TypeName")))
);

rules.set("SingleElementAnnotation", () =>
  Diagram(Sequence(T("@"), NT("TypeName"), T("("), NT("ElementValue"), T(")")))
);

// ===== §10 Arrays =====

rules.set("ArrayInitializer", () =>
  Diagram(
    Sequence(
      T("{"),
      Optional(NT("VariableInitializerList")),
      Optional(T(",")),
      T("}")
    )
  )
);

rules.set("VariableInitializerList", () =>
  Diagram(
    Sequence(
      NT("VariableInitializer"),
      ZeroOrMore(Sequence(T(","), NT("VariableInitializer")))
    )
  )
);

// ===== §14 Blocks, Statements, and Patterns =====

rules.set("Block", () =>
  Diagram(Sequence(T("{"), Optional(NT("BlockStatements")), T("}")))
);

rules.set("BlockStatements", () =>
  Diagram(OneOrMore(NT("BlockStatement")))
);

rules.set("BlockStatement", () =>
  Diagram(
    Choice(0,
      NT("LocalClassOrInterfaceDeclaration"),
      NT("LocalVariableDeclarationStatement"),
      NT("Statement")
    )
  )
);

rules.set("LocalClassOrInterfaceDeclaration", () =>
  Diagram(Choice(0, NT("ClassDeclaration"), NT("NormalInterfaceDeclaration")))
);

rules.set("LocalVariableDeclarationStatement", () =>
  Diagram(Sequence(NT("LocalVariableDeclaration"), T(";")))
);

rules.set("LocalVariableDeclaration", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("VariableModifier")),
      NT("LocalVariableType"),
      NT("VariableDeclaratorList")
    )
  )
);

rules.set("LocalVariableType", () =>
  Diagram(Choice(0, NT("UnannType"), T("var")))
);

rules.set("Statement", () =>
  Diagram(
    Choice(0,
      NT("StatementWithoutTrailingSubstatement"),
      NT("LabeledStatement"),
      NT("IfThenStatement"),
      NT("IfThenElseStatement"),
      NT("WhileStatement"),
      NT("ForStatement")
    )
  )
);

rules.set("StatementNoShortIf", () =>
  Diagram(
    Choice(0,
      NT("StatementWithoutTrailingSubstatement"),
      NT("LabeledStatementNoShortIf"),
      NT("IfThenElseStatementNoShortIf"),
      NT("WhileStatementNoShortIf"),
      NT("ForStatementNoShortIf")
    )
  )
);

rules.set("StatementWithoutTrailingSubstatement", () =>
  Diagram(
    Choice(0,
      NT("Block"),
      NT("EmptyStatement"),
      NT("ExpressionStatement"),
      NT("AssertStatement"),
      NT("SwitchStatement"),
      NT("DoStatement"),
      NT("BreakStatement"),
      NT("ContinueStatement"),
      NT("ReturnStatement"),
      NT("SynchronizedStatement"),
      NT("ThrowStatement"),
      NT("TryStatement"),
      NT("YieldStatement")
    )
  )
);

rules.set("EmptyStatement", () =>
  Diagram(T(";"))
);

rules.set("LabeledStatement", () =>
  Diagram(Sequence(NT("Identifier"), T(":"), NT("Statement")))
);

rules.set("LabeledStatementNoShortIf", () =>
  Diagram(Sequence(NT("Identifier"), T(":"), NT("StatementNoShortIf")))
);

rules.set("ExpressionStatement", () =>
  Diagram(Sequence(NT("StatementExpression"), T(";")))
);

rules.set("StatementExpression", () =>
  Diagram(
    Choice(0,
      NT("Assignment"),
      NT("PreIncrementExpression"),
      NT("PreDecrementExpression"),
      NT("PostIncrementExpression"),
      NT("PostDecrementExpression"),
      NT("MethodInvocation"),
      NT("ClassInstanceCreationExpression")
    )
  )
);

rules.set("IfThenStatement", () =>
  Diagram(Sequence(T("if"), T("("), NT("Expression"), T(")"), NT("Statement")))
);

rules.set("IfThenElseStatement", () =>
  Diagram(Sequence(T("if"), T("("), NT("Expression"), T(")"), NT("StatementNoShortIf"), T("else"), NT("Statement")))
);

rules.set("IfThenElseStatementNoShortIf", () =>
  Diagram(Sequence(T("if"), T("("), NT("Expression"), T(")"), NT("StatementNoShortIf"), T("else"), NT("StatementNoShortIf")))
);

rules.set("AssertStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("assert"), NT("Expression"), T(";")),
      Sequence(T("assert"), NT("Expression"), T(":"), NT("Expression"), T(";"))
    )
  )
);

rules.set("SwitchStatement", () =>
  Diagram(Sequence(T("switch"), T("("), NT("Expression"), T(")"), NT("SwitchBlock")))
);

rules.set("SwitchBlock", () =>
  Diagram(
    Choice(0,
      Sequence(T("{"), OneOrMore(NT("SwitchRule")), T("}")),
      Sequence(T("{"), ZeroOrMore(NT("SwitchBlockStatementGroup")), ZeroOrMore(Sequence(NT("SwitchLabel"), T(":"))), T("}"))
    )
  )
);

rules.set("SwitchRule", () =>
  Diagram(
    Choice(0,
      Sequence(NT("SwitchLabel"), T("->"), NT("Expression"), T(";")),
      Sequence(NT("SwitchLabel"), T("->"), NT("Block")),
      Sequence(NT("SwitchLabel"), T("->"), NT("ThrowStatement"))
    )
  )
);

rules.set("SwitchBlockStatementGroup", () =>
  Diagram(
    Sequence(
      NT("SwitchLabel"),
      T(":"),
      ZeroOrMore(Sequence(NT("SwitchLabel"), T(":"))),
      NT("BlockStatements")
    )
  )
);

rules.set("SwitchLabel", () =>
  Diagram(
    Choice(0,
      Sequence(T("case"), NT("CaseConstant"), ZeroOrMore(Sequence(T(","), NT("CaseConstant")))),
      Sequence(T("case"), T("null"), Optional(Sequence(T(","), T("default")))),
      Sequence(T("case"), NT("CasePattern"), ZeroOrMore(Sequence(T(","), NT("CasePattern"))), Optional(NT("Guard"))),
      T("default")
    )
  )
);

rules.set("CaseConstant", () =>
  Diagram(NT("ConditionalExpression"))
);

rules.set("CasePattern", () =>
  Diagram(NT("Pattern"))
);

rules.set("Guard", () =>
  Diagram(Sequence(T("when"), NT("Expression")))
);

rules.set("WhileStatement", () =>
  Diagram(Sequence(T("while"), T("("), NT("Expression"), T(")"), NT("Statement")))
);

rules.set("WhileStatementNoShortIf", () =>
  Diagram(Sequence(T("while"), T("("), NT("Expression"), T(")"), NT("StatementNoShortIf")))
);

rules.set("DoStatement", () =>
  Diagram(Sequence(T("do"), NT("Statement"), T("while"), T("("), NT("Expression"), T(")"), T(";")))
);

rules.set("ForStatement", () =>
  Diagram(Choice(0, NT("BasicForStatement"), NT("EnhancedForStatement")))
);

rules.set("ForStatementNoShortIf", () =>
  Diagram(Choice(0, NT("BasicForStatementNoShortIf"), NT("EnhancedForStatementNoShortIf")))
);

rules.set("BasicForStatement", () =>
  Diagram(
    Sequence(
      T("for"),
      T("("),
      Optional(NT("ForInit")),
      T(";"),
      Optional(NT("Expression")),
      T(";"),
      Optional(NT("ForUpdate")),
      T(")"),
      NT("Statement")
    )
  )
);

rules.set("BasicForStatementNoShortIf", () =>
  Diagram(
    Sequence(
      T("for"),
      T("("),
      Optional(NT("ForInit")),
      T(";"),
      Optional(NT("Expression")),
      T(";"),
      Optional(NT("ForUpdate")),
      T(")"),
      NT("StatementNoShortIf")
    )
  )
);

rules.set("ForInit", () =>
  Diagram(Choice(0, NT("StatementExpressionList"), NT("LocalVariableDeclaration")))
);

rules.set("ForUpdate", () =>
  Diagram(NT("StatementExpressionList"))
);

rules.set("StatementExpressionList", () =>
  Diagram(
    Sequence(
      NT("StatementExpression"),
      ZeroOrMore(Sequence(T(","), NT("StatementExpression")))
    )
  )
);

rules.set("EnhancedForStatement", () =>
  Diagram(
    Sequence(T("for"), T("("), NT("LocalVariableDeclaration"), T(":"), NT("Expression"), T(")"), NT("Statement"))
  )
);

rules.set("EnhancedForStatementNoShortIf", () =>
  Diagram(
    Sequence(T("for"), T("("), NT("LocalVariableDeclaration"), T(":"), NT("Expression"), T(")"), NT("StatementNoShortIf"))
  )
);

rules.set("BreakStatement", () =>
  Diagram(Sequence(T("break"), Optional(NT("Identifier")), T(";")))
);

rules.set("YieldStatement", () =>
  Diagram(Sequence(T("yield"), NT("Expression"), T(";")))
);

rules.set("ContinueStatement", () =>
  Diagram(Sequence(T("continue"), Optional(NT("Identifier")), T(";")))
);

rules.set("ReturnStatement", () =>
  Diagram(Sequence(T("return"), Optional(NT("Expression")), T(";")))
);

rules.set("ThrowStatement", () =>
  Diagram(Sequence(T("throw"), NT("Expression"), T(";")))
);

rules.set("SynchronizedStatement", () =>
  Diagram(Sequence(T("synchronized"), T("("), NT("Expression"), T(")"), NT("Block")))
);

rules.set("TryStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("try"), NT("Block"), NT("Catches")),
      Sequence(T("try"), NT("Block"), Optional(NT("Catches")), NT("Finally")),
      NT("TryWithResourcesStatement")
    )
  )
);

rules.set("Catches", () =>
  Diagram(OneOrMore(NT("CatchClause")))
);

rules.set("CatchClause", () =>
  Diagram(Sequence(T("catch"), T("("), NT("CatchFormalParameter"), T(")"), NT("Block")))
);

rules.set("CatchFormalParameter", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("VariableModifier")),
      NT("CatchType"),
      NT("VariableDeclaratorId")
    )
  )
);

rules.set("CatchType", () =>
  Diagram(
    Sequence(
      NT("UnannClassType"),
      ZeroOrMore(Sequence(T("|"), NT("ClassType")))
    )
  )
);

rules.set("Finally", () =>
  Diagram(Sequence(T("finally"), NT("Block")))
);

rules.set("TryWithResourcesStatement", () =>
  Diagram(
    Sequence(
      T("try"),
      NT("ResourceSpecification"),
      NT("Block"),
      Optional(NT("Catches")),
      Optional(NT("Finally"))
    )
  )
);

rules.set("ResourceSpecification", () =>
  Diagram(Sequence(T("("), NT("ResourceList"), Optional(T(";")), T(")")))
);

rules.set("ResourceList", () =>
  Diagram(
    Sequence(
      NT("Resource"),
      ZeroOrMore(Sequence(T(";"), NT("Resource")))
    )
  )
);

rules.set("Resource", () =>
  Diagram(Choice(0, NT("LocalVariableDeclaration"), NT("VariableAccess")))
);

rules.set("VariableAccess", () =>
  Diagram(Choice(0, NT("ExpressionName"), NT("FieldAccess")))
);

rules.set("Pattern", () =>
  Diagram(Choice(0, NT("TypePattern"), NT("RecordPattern")))
);

rules.set("TypePattern", () =>
  Diagram(NT("LocalVariableDeclaration"))
);

rules.set("RecordPattern", () =>
  Diagram(
    Sequence(
      NT("ReferenceType"),
      T("("),
      Optional(NT("ComponentPatternList")),
      T(")")
    )
  )
);

rules.set("ComponentPatternList", () =>
  Diagram(
    Sequence(
      NT("ComponentPattern"),
      ZeroOrMore(Sequence(T(","), NT("ComponentPattern")))
    )
  )
);

rules.set("ComponentPattern", () =>
  Diagram(Choice(0, NT("Pattern"), NT("MatchAllPattern")))
);

rules.set("MatchAllPattern", () =>
  Diagram(T("_"))
);

// ===== §15 Expressions =====

rules.set("Primary", () =>
  Diagram(Choice(0, NT("PrimaryNoNewArray"), NT("ArrayCreationExpression")))
);

rules.set("PrimaryNoNewArray", () =>
  Diagram(
    Choice(0,
      NT("Literal"),
      NT("ClassLiteral"),
      T("this"),
      Sequence(NT("TypeName"), T("."), T("this")),
      Sequence(T("("), NT("Expression"), T(")")),
      NT("ClassInstanceCreationExpression"),
      NT("FieldAccess"),
      NT("ArrayAccess"),
      NT("MethodInvocation"),
      NT("MethodReference")
    )
  )
);

rules.set("ClassLiteral", () =>
  Diagram(
    Choice(0,
      Sequence(NT("TypeName"), ZeroOrMore(Sequence(T("["), T("]"))), T("."), T("class")),
      Sequence(NT("NumericType"), ZeroOrMore(Sequence(T("["), T("]"))), T("."), T("class")),
      Sequence(T("boolean"), ZeroOrMore(Sequence(T("["), T("]"))), T("."), T("class")),
      Sequence(T("void"), T("."), T("class"))
    )
  )
);

rules.set("ClassInstanceCreationExpression", () =>
  Diagram(
    Choice(0,
      NT("UnqualifiedClassInstanceCreationExpression"),
      Sequence(NT("ExpressionName"), T("."), NT("UnqualifiedClassInstanceCreationExpression")),
      Sequence(NT("Primary"), T("."), NT("UnqualifiedClassInstanceCreationExpression"))
    )
  )
);

rules.set("UnqualifiedClassInstanceCreationExpression", () =>
  Diagram(
    Sequence(
      T("new"),
      Optional(NT("TypeArguments")),
      NT("ClassOrInterfaceTypeToInstantiate"),
      T("("),
      Optional(NT("ArgumentList")),
      T(")"),
      Optional(NT("ClassBody"))
    )
  )
);

rules.set("ClassOrInterfaceTypeToInstantiate", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("Annotation")),
      NT("Identifier"),
      ZeroOrMore(Sequence(T("."), ZeroOrMore(NT("Annotation")), NT("Identifier"))),
      Optional(NT("TypeArgumentsOrDiamond"))
    )
  )
);

rules.set("TypeArgumentsOrDiamond", () =>
  Diagram(Choice(0, NT("TypeArguments"), Sequence(T("<"), T(">"))))
);

rules.set("ArrayCreationExpression", () =>
  Diagram(
    Choice(0,
      NT("ArrayCreationExpressionWithoutInitializer"),
      NT("ArrayCreationExpressionWithInitializer")
    )
  )
);

rules.set("ArrayCreationExpressionWithoutInitializer", () =>
  Diagram(
    Choice(0,
      Sequence(T("new"), NT("PrimitiveType"), NT("DimExprs"), Optional(NT("Dims"))),
      Sequence(T("new"), NT("ClassOrInterfaceType"), NT("DimExprs"), Optional(NT("Dims")))
    )
  )
);

rules.set("ArrayCreationExpressionWithInitializer", () =>
  Diagram(
    Choice(0,
      Sequence(T("new"), NT("PrimitiveType"), NT("Dims"), NT("ArrayInitializer")),
      Sequence(T("new"), NT("ClassOrInterfaceType"), NT("Dims"), NT("ArrayInitializer"))
    )
  )
);

rules.set("DimExprs", () =>
  Diagram(OneOrMore(NT("DimExpr")))
);

rules.set("DimExpr", () =>
  Diagram(Sequence(ZeroOrMore(NT("Annotation")), T("["), NT("Expression"), T("]")))
);

rules.set("ArrayAccess", () =>
  Diagram(
    Choice(0,
      Sequence(NT("ExpressionName"), T("["), NT("Expression"), T("]")),
      Sequence(NT("PrimaryNoNewArray"), T("["), NT("Expression"), T("]")),
      Sequence(NT("ArrayCreationExpressionWithInitializer"), T("["), NT("Expression"), T("]"))
    )
  )
);

rules.set("FieldAccess", () =>
  Diagram(
    Choice(0,
      Sequence(NT("Primary"), T("."), NT("Identifier")),
      Sequence(T("super"), T("."), NT("Identifier")),
      Sequence(NT("TypeName"), T("."), T("super"), T("."), NT("Identifier"))
    )
  )
);

rules.set("MethodInvocation", () =>
  Diagram(
    Choice(0,
      Sequence(NT("MethodName"), T("("), Optional(NT("ArgumentList")), T(")")),
      Sequence(NT("TypeName"), T("."), Optional(NT("TypeArguments")), NT("Identifier"), T("("), Optional(NT("ArgumentList")), T(")")),
      Sequence(NT("ExpressionName"), T("."), Optional(NT("TypeArguments")), NT("Identifier"), T("("), Optional(NT("ArgumentList")), T(")")),
      Sequence(NT("Primary"), T("."), Optional(NT("TypeArguments")), NT("Identifier"), T("("), Optional(NT("ArgumentList")), T(")")),
      Sequence(T("super"), T("."), Optional(NT("TypeArguments")), NT("Identifier"), T("("), Optional(NT("ArgumentList")), T(")")),
      Sequence(NT("TypeName"), T("."), T("super"), T("."), Optional(NT("TypeArguments")), NT("Identifier"), T("("), Optional(NT("ArgumentList")), T(")"))
    )
  )
);

rules.set("ArgumentList", () =>
  Diagram(
    Sequence(
      NT("Expression"),
      ZeroOrMore(Sequence(T(","), NT("Expression")))
    )
  )
);

rules.set("MethodReference", () =>
  Diagram(
    Choice(0,
      Sequence(NT("ExpressionName"), T("::"), Optional(NT("TypeArguments")), NT("Identifier")),
      Sequence(NT("Primary"), T("::"), Optional(NT("TypeArguments")), NT("Identifier")),
      Sequence(NT("ReferenceType"), T("::"), Optional(NT("TypeArguments")), NT("Identifier")),
      Sequence(T("super"), T("::"), Optional(NT("TypeArguments")), NT("Identifier")),
      Sequence(NT("TypeName"), T("."), T("super"), T("::"), Optional(NT("TypeArguments")), NT("Identifier")),
      Sequence(NT("ClassType"), T("::"), Optional(NT("TypeArguments")), T("new")),
      Sequence(NT("ArrayType"), T("::"), T("new"))
    )
  )
);

rules.set("Expression", () =>
  Diagram(Choice(0, NT("LambdaExpression"), NT("AssignmentExpression")))
);

rules.set("LambdaExpression", () =>
  Diagram(Sequence(NT("LambdaParameters"), T("->"), NT("LambdaBody")))
);

rules.set("LambdaParameters", () =>
  Diagram(
    Choice(0,
      Sequence(T("("), Optional(NT("LambdaParameterList")), T(")")),
      NT("ConciseLambdaParameter")
    )
  )
);

rules.set("LambdaParameterList", () =>
  Diagram(
    Choice(0,
      Sequence(NT("NormalLambdaParameter"), ZeroOrMore(Sequence(T(","), NT("NormalLambdaParameter")))),
      Sequence(NT("ConciseLambdaParameter"), ZeroOrMore(Sequence(T(","), NT("ConciseLambdaParameter"))))
    )
  )
);

rules.set("NormalLambdaParameter", () =>
  Diagram(
    Choice(0,
      Sequence(ZeroOrMore(NT("VariableModifier")), NT("LambdaParameterType"), NT("VariableDeclaratorId")),
      NT("VariableArityParameter")
    )
  )
);

rules.set("LambdaParameterType", () =>
  Diagram(Choice(0, NT("UnannType"), T("var")))
);

rules.set("ConciseLambdaParameter", () =>
  Diagram(Choice(0, NT("Identifier"), T("_")))
);

rules.set("LambdaBody", () =>
  Diagram(Choice(0, NT("Expression"), NT("Block")))
);

rules.set("AssignmentExpression", () =>
  Diagram(Choice(0, NT("ConditionalExpression"), NT("Assignment")))
);

rules.set("Assignment", () =>
  Diagram(Sequence(NT("LeftHandSide"), NT("AssignmentOperator"), NT("Expression")))
);

rules.set("LeftHandSide", () =>
  Diagram(Choice(0, NT("ExpressionName"), NT("FieldAccess"), NT("ArrayAccess")))
);

rules.set("AssignmentOperator", () =>
  Diagram(
    Choice(0,
      T("="), T("*="), T("/="), T("%="), T("+="), T("-="),
      T("<<="), T(">>="), T(">>>="), T("&="), T("^="), T("|=")
    )
  )
);

rules.set("ConditionalExpression", () =>
  Diagram(
    Choice(0,
      NT("ConditionalOrExpression"),
      Sequence(NT("ConditionalOrExpression"), T("?"), NT("Expression"), T(":"), NT("ConditionalExpression")),
      Sequence(NT("ConditionalOrExpression"), T("?"), NT("Expression"), T(":"), NT("LambdaExpression"))
    )
  )
);

// precedence-chain helper: BASE ( (op) BASE )*
function chain(base: string, ops: string[]) {
  return Sequence(
    NT(base),
    ZeroOrMore(Sequence(Choice(0, ...ops.map(T)), NT(base)))
  );
}

rules.set("ConditionalOrExpression", () =>
  Diagram(chain("ConditionalAndExpression", ["||"]))
);

rules.set("ConditionalAndExpression", () =>
  Diagram(chain("InclusiveOrExpression", ["&&"]))
);

rules.set("InclusiveOrExpression", () =>
  Diagram(chain("ExclusiveOrExpression", ["|"]))
);

rules.set("ExclusiveOrExpression", () =>
  Diagram(chain("AndExpression", ["^"]))
);

rules.set("AndExpression", () =>
  Diagram(chain("EqualityExpression", ["&"]))
);

rules.set("EqualityExpression", () =>
  Diagram(chain("RelationalExpression", ["==", "!="]))
);

rules.set("RelationalExpression", () =>
  Diagram(
    Choice(0,
      chain("ShiftExpression", ["<", ">", "<=", ">="]),
      NT("InstanceofExpression")
    )
  )
);

rules.set("InstanceofExpression", () =>
  Diagram(
    Choice(0,
      Sequence(NT("RelationalExpression"), T("instanceof"), NT("ReferenceType")),
      Sequence(NT("RelationalExpression"), T("instanceof"), NT("Pattern"))
    )
  )
);

rules.set("ShiftExpression", () =>
  Diagram(chain("AdditiveExpression", ["<<", ">>", ">>>"]))
);

rules.set("AdditiveExpression", () =>
  Diagram(chain("MultiplicativeExpression", ["+", "-"]))
);

rules.set("MultiplicativeExpression", () =>
  Diagram(chain("UnaryExpression", ["*", "/", "%"]))
);

rules.set("UnaryExpression", () =>
  Diagram(
    Choice(0,
      NT("PreIncrementExpression"),
      NT("PreDecrementExpression"),
      Sequence(T("+"), NT("UnaryExpression")),
      Sequence(T("-"), NT("UnaryExpression")),
      NT("UnaryExpressionNotPlusMinus")
    )
  )
);

rules.set("PreIncrementExpression", () =>
  Diagram(Sequence(T("++"), NT("UnaryExpression")))
);

rules.set("PreDecrementExpression", () =>
  Diagram(Sequence(T("--"), NT("UnaryExpression")))
);

rules.set("UnaryExpressionNotPlusMinus", () =>
  Diagram(
    Choice(0,
      NT("PostfixExpression"),
      Sequence(T("~"), NT("UnaryExpression")),
      Sequence(T("!"), NT("UnaryExpression")),
      NT("CastExpression"),
      NT("SwitchExpression")
    )
  )
);

rules.set("PostfixExpression", () =>
  Diagram(
    Choice(0,
      NT("Primary"),
      NT("ExpressionName"),
      NT("PostIncrementExpression"),
      NT("PostDecrementExpression")
    )
  )
);

rules.set("PostIncrementExpression", () =>
  Diagram(Sequence(NT("PostfixExpression"), T("++")))
);

rules.set("PostDecrementExpression", () =>
  Diagram(Sequence(NT("PostfixExpression"), T("--")))
);

rules.set("CastExpression", () =>
  Diagram(
    Choice(0,
      Sequence(T("("), NT("PrimitiveType"), T(")"), NT("UnaryExpression")),
      Sequence(T("("), NT("ReferenceType"), ZeroOrMore(NT("AdditionalBound")), T(")"), NT("UnaryExpressionNotPlusMinus")),
      Sequence(T("("), NT("ReferenceType"), ZeroOrMore(NT("AdditionalBound")), T(")"), NT("LambdaExpression"))
    )
  )
);

rules.set("SwitchExpression", () =>
  Diagram(Sequence(T("switch"), T("("), NT("Expression"), T(")"), NT("SwitchBlock")))
);

// --- React/TS integration exports --------------------------------------------

export type SectionId = "lexical" | "types" | "names" | "packages" | "classes" | "interfaces" | "arrays" | "statements" | "expressions";
export type RuleName = string;

// Source-of-truth: which rules belong to which section
export const SECTION_ORDER: SectionId[] = [
  "lexical",
  "types",
  "names",
  "packages",
  "classes",
  "interfaces",
  "arrays",
  "statements",
  "expressions"
];

export const SECTION_TITLES: Record<SectionId, string> = {
  lexical: "§3 Lexical Structure",
  types: "§4 Types, Values, and Variables",
  names: "§6 Names",
  packages: "§7 Packages and Modules",
  classes: "§8 Classes",
  interfaces: "§9 Interfaces",
  arrays: "§10 Arrays",
  statements: "§14 Blocks, Statements, and Patterns",
  expressions: "§15 Expressions"
};

export const SECTION_RULES: Record<SectionId, RuleName[]> = {
  "lexical": [
    "Identifier",
    "IdentifierChars",
    "JavaLetter",
    "JavaLetterOrDigit",
    "TypeIdentifier",
    "UnqualifiedMethodIdentifier",
    "Literal"
  ],
  "types": [
    "Type",
    "PrimitiveType",
    "NumericType",
    "IntegralType",
    "FloatingPointType",
    "ReferenceType",
    "ClassOrInterfaceType",
    "ClassType",
    "InterfaceType",
    "TypeVariable",
    "ArrayType",
    "Dims",
    "TypeParameter",
    "TypeParameterModifier",
    "TypeBound",
    "AdditionalBound",
    "TypeArguments",
    "TypeArgumentList",
    "TypeArgument",
    "Wildcard",
    "WildcardBounds"
  ],
  "names": [
    "ModuleName",
    "PackageName",
    "TypeName",
    "ExpressionName",
    "MethodName",
    "PackageOrTypeName",
    "AmbiguousName"
  ],
  "packages": [
    "CompilationUnit",
    "OrdinaryCompilationUnit",
    "ModularCompilationUnit",
    "PackageDeclaration",
    "PackageModifier",
    "ImportDeclaration",
    "SingleTypeImportDeclaration",
    "TypeImportOnDemandDeclaration",
    "SingleStaticImportDeclaration",
    "StaticImportOnDemandDeclaration",
    "TopLevelClassOrInterfaceDeclaration",
    "ModuleDeclaration",
    "ModuleDirective",
    "RequiresModifier"
  ],
  "classes": [
    "ClassDeclaration",
    "NormalClassDeclaration",
    "ClassModifier",
    "TypeParameters",
    "TypeParameterList",
    "ClassExtends",
    "ClassImplements",
    "InterfaceTypeList",
    "ClassPermits",
    "ClassBody",
    "ClassBodyDeclaration",
    "ClassMemberDeclaration",
    "FieldDeclaration",
    "FieldModifier",
    "VariableDeclaratorList",
    "VariableDeclarator",
    "VariableDeclaratorId",
    "VariableInitializer",
    "UnannType",
    "UnannPrimitiveType",
    "UnannReferenceType",
    "UnannClassOrInterfaceType",
    "UnannClassType",
    "UnannInterfaceType",
    "UnannTypeVariable",
    "UnannArrayType",
    "MethodDeclaration",
    "MethodModifier",
    "MethodHeader",
    "Result",
    "MethodDeclarator",
    "ReceiverParameter",
    "FormalParameterList",
    "FormalParameter",
    "VariableArityParameter",
    "VariableModifier",
    "Throws",
    "ExceptionTypeList",
    "ExceptionType",
    "MethodBody",
    "InstanceInitializer",
    "StaticInitializer",
    "ConstructorDeclaration",
    "ConstructorModifier",
    "ConstructorDeclarator",
    "SimpleTypeName",
    "ConstructorBody",
    "ConstructorInvocation",
    "EnumDeclaration",
    "EnumBody",
    "EnumConstantList",
    "EnumConstant",
    "EnumConstantModifier",
    "EnumBodyDeclarations",
    "RecordDeclaration",
    "RecordHeader",
    "RecordComponentList",
    "RecordComponent",
    "VariableArityRecordComponent",
    "RecordComponentModifier",
    "RecordBody",
    "RecordBodyDeclaration",
    "CompactConstructorDeclaration"
  ],
  "interfaces": [
    "InterfaceDeclaration",
    "NormalInterfaceDeclaration",
    "InterfaceModifier",
    "InterfaceExtends",
    "InterfacePermits",
    "InterfaceBody",
    "InterfaceMemberDeclaration",
    "ConstantDeclaration",
    "ConstantModifier",
    "InterfaceMethodDeclaration",
    "InterfaceMethodModifier",
    "AnnotationInterfaceDeclaration",
    "AnnotationInterfaceBody",
    "AnnotationInterfaceMemberDeclaration",
    "AnnotationInterfaceElementDeclaration",
    "AnnotationInterfaceElementModifier",
    "DefaultValue",
    "Annotation",
    "NormalAnnotation",
    "ElementValuePairList",
    "ElementValuePair",
    "ElementValue",
    "ElementValueArrayInitializer",
    "ElementValueList",
    "MarkerAnnotation",
    "SingleElementAnnotation"
  ],
  "arrays": [
    "ArrayInitializer",
    "VariableInitializerList"
  ],
  "statements": [
    "Block",
    "BlockStatements",
    "BlockStatement",
    "LocalClassOrInterfaceDeclaration",
    "LocalVariableDeclarationStatement",
    "LocalVariableDeclaration",
    "LocalVariableType",
    "Statement",
    "StatementNoShortIf",
    "StatementWithoutTrailingSubstatement",
    "EmptyStatement",
    "LabeledStatement",
    "LabeledStatementNoShortIf",
    "ExpressionStatement",
    "StatementExpression",
    "IfThenStatement",
    "IfThenElseStatement",
    "IfThenElseStatementNoShortIf",
    "AssertStatement",
    "SwitchStatement",
    "SwitchBlock",
    "SwitchRule",
    "SwitchBlockStatementGroup",
    "SwitchLabel",
    "CaseConstant",
    "CasePattern",
    "Guard",
    "WhileStatement",
    "WhileStatementNoShortIf",
    "DoStatement",
    "ForStatement",
    "ForStatementNoShortIf",
    "BasicForStatement",
    "BasicForStatementNoShortIf",
    "ForInit",
    "ForUpdate",
    "StatementExpressionList",
    "EnhancedForStatement",
    "EnhancedForStatementNoShortIf",
    "BreakStatement",
    "YieldStatement",
    "ContinueStatement",
    "ReturnStatement",
    "ThrowStatement",
    "SynchronizedStatement",
    "TryStatement",
    "Catches",
    "CatchClause",
    "CatchFormalParameter",
    "CatchType",
    "Finally",
    "TryWithResourcesStatement",
    "ResourceSpecification",
    "ResourceList",
    "Resource",
    "VariableAccess",
    "Pattern",
    "TypePattern",
    "RecordPattern",
    "ComponentPatternList",
    "ComponentPattern",
    "MatchAllPattern"
  ],
  "expressions": [
    "Primary",
    "PrimaryNoNewArray",
    "ClassLiteral",
    "ClassInstanceCreationExpression",
    "UnqualifiedClassInstanceCreationExpression",
    "ClassOrInterfaceTypeToInstantiate",
    "TypeArgumentsOrDiamond",
    "ArrayCreationExpression",
    "ArrayCreationExpressionWithoutInitializer",
    "ArrayCreationExpressionWithInitializer",
    "DimExprs",
    "DimExpr",
    "ArrayAccess",
    "FieldAccess",
    "MethodInvocation",
    "ArgumentList",
    "MethodReference",
    "Expression",
    "LambdaExpression",
    "LambdaParameters",
    "LambdaParameterList",
    "NormalLambdaParameter",
    "LambdaParameterType",
    "ConciseLambdaParameter",
    "LambdaBody",
    "AssignmentExpression",
    "Assignment",
    "LeftHandSide",
    "AssignmentOperator",
    "ConditionalExpression",
    "ConditionalOrExpression",
    "ConditionalAndExpression",
    "InclusiveOrExpression",
    "ExclusiveOrExpression",
    "AndExpression",
    "EqualityExpression",
    "RelationalExpression",
    "InstanceofExpression",
    "ShiftExpression",
    "AdditiveExpression",
    "MultiplicativeExpression",
    "UnaryExpression",
    "PreIncrementExpression",
    "PreDecrementExpression",
    "UnaryExpressionNotPlusMinus",
    "PostfixExpression",
    "PostIncrementExpression",
    "PostDecrementExpression",
    "CastExpression",
    "SwitchExpression"
  ]
};

// Expose safe accessors for React UI.
export function getRuleFactory(name: RuleName): (() => any) | undefined {
  return rules.get(name);
}

export function createRuleDiagram(name: RuleName): any {
  const factory = rules.get(name);
  if (!factory) {
    return Diagram(Comment(`No factory defined for ${name}`));
  }
  return factory();
}
