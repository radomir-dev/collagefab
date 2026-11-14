import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReflectionKind } from 'typedoc';
import type {
  DeclarationReflection,
  ProjectReflection,
  ReferenceType,
  ReflectionType,
  SomeType,
} from 'typedoc';
import { COLLAGE_FAB_DEFAULTS } from '../src/components/collageFabDefaults.ts';
import type { ApiDocs, ApiFieldDoc, ApiPropDoc, ApiSlotDoc } from '../src/docs/api-docs.types.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

export const COMPONENT_FILE = path.join(ROOT, 'src/components/CollageFab.tsx');
const DEFAULTS_FILE = path.join(ROOT, 'src/components/collageFabDefaults.ts');

/** Every file whose edit can change the generated docs. */
export const DOCS_SOURCES = [COMPONENT_FILE, DEFAULTS_FILE];

const REACT_PROP_SOURCE = path.join('@types', 'react');

interface TypeContext {
  project: ProjectReflection;
  aliases: Map<string, SomeType>;
}

export async function generateApiDocs(): Promise<ApiDocs> {
  const { Application } = await import('typedoc');
  const app = await Application.bootstrap({
    entryPoints: [COMPONENT_FILE],
    tsconfig: path.join(ROOT, 'tsconfig.json'),
    validation: { notDocumented: true },
    sort: ['source-order'],
    logLevel: 'Error',
  });

  const warnings: string[] = [];
  app.logger.warn = (message: string) => {
    warnings.push(message);
  };

  const project = await app.convert();
  if (!project) {
    throw new Error(`TypeDoc could not read ${COMPONENT_FILE}`);
  }
  app.validate(project);
  if (warnings.length > 0) {
    throw new Error(
      `The API docs cannot be generated because the public API is undocumented:\n${warnings.join('\n')}`,
    );
  }

  const context: TypeContext = {
    project,
    aliases: new Map(
      (project.children ?? [])
        .filter((child) => child.kind === ReflectionKind.TypeAlias && child.type)
        .map((child) => [child.name, child.type!] as const),
    ),
  };

  const propsReflection = reflection(project, 'CollageFabProps');
  const propChildren = propsReflection.children ?? [];
  const inherited = propChildren.filter(isReactProp);
  const own = propChildren.filter((child) => !isReactProp(child));

  const ownerState = fieldsOf(project, 'CollageFabOwnerState', context);
  const ownerNames = new Set(ownerState.map((field) => field.name));

  return {
    summary: description(reflection(project, 'CollageFab')),
    props: own.map((child) => propDoc(child, context)),
    restProps: inherited.length > 0 ? 'React.HTMLAttributes<HTMLDivElement>' : '',
    slots: (reflection(project, 'CollageFabSlots').children ?? []).map((child) => slotDoc(child)),
    ownerState,
    itemOwnerState: fieldsOf(project, 'CollageFabItemOwnerState', context).filter(
      (field) => !ownerNames.has(field.name),
    ),
    geometry: fieldsOf(project, 'CollageFabItemGeometry', context),
    unions: {
      direction: unionValues(project, 'CollageFabDirection'),
      trigger: unionValues(project, 'CollageFabTrigger'),
      variant: unionValues(project, 'CollageFabVariant'),
    },
  };
}

function reflection(project: ProjectReflection, name: string): DeclarationReflection {
  const found = project.getChildByName(name);
  if (!found) {
    throw new Error(`TypeDoc did not find "${name}" in ${path.basename(COMPONENT_FILE)}`);
  }
  return found as DeclarationReflection;
}

function isReactProp(child: DeclarationReflection): boolean {
  return (child.sources?.[0]?.fileName ?? '').includes(REACT_PROP_SOURCE);
}

function propDoc(child: DeclarationReflection, context: TypeContext): ApiPropDoc {
  return {
    name: child.name,
    type: typeText(child.type, context),
    default: formatDefault(defaultOf(child.name)),
    description: description(child),
  };
}

function fieldDoc(child: DeclarationReflection, context: TypeContext): ApiFieldDoc {
  return {
    name: child.name,
    type: typeText(child.type, context),
    description: description(child),
  };
}

function slotDoc(child: DeclarationReflection): ApiSlotDoc {
  return { name: child.name, description: description(child) };
}

function defaultOf(name: string): string | number | boolean | undefined {
  return name in COLLAGE_FAB_DEFAULTS
    ? COLLAGE_FAB_DEFAULTS[name as keyof typeof COLLAGE_FAB_DEFAULTS]
    : undefined;
}

function formatDefault(value: string | number | boolean | undefined): string {
  if (value === undefined) {
    return '—';
  }
  return typeof value === 'string' ? `'${value}'` : String(value);
}

function fieldsOf(project: ProjectReflection, name: string, context: TypeContext): ApiFieldDoc[] {
  return (reflection(project, name).children ?? []).map((child) => fieldDoc(child, context));
}

function unionValues<T extends string>(project: ProjectReflection, name: string): T[] {
  const type = reflection(project, name).type;
  if (!type || type.type !== 'union') {
    throw new Error(`"${name}" is expected to be a union of literals`);
  }
  const values: string[] = type.types.flatMap((member) =>
    member.type === 'literal' ? [String(member.value)] : [],
  );
  return values as T[];
}

function description(node: { comment?: { summary?: Array<{ text: string }> } }): string {
  return (node.comment?.summary ?? [])
    .map((part) => part.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function typeText(type: SomeType | undefined, context: TypeContext, depth = 0): string {
  if (!type) {
    return 'unknown';
  }
  switch (type.type) {
    case 'intrinsic':
      return type.name;
    case 'literal':
      return typeof type.value === 'string' ? `'${type.value}'` : String(type.value);
    case 'union':
      return type.types.map((member) => typeText(member, context, depth)).join(' | ');
    case 'intersection':
      return type.types.map((member) => typeText(member, context, depth)).join(' & ');
    case 'array':
      return `${typeText(type.elementType, context, depth)}[]`;
    case 'reference':
      return referenceText(type, context, depth);
    case 'reflection':
      return reflectionText(type, context, depth);
    default:
      return 'name' in type && typeof type.name === 'string' ? type.name : 'unknown';
  }
}

function referenceText(type: ReferenceType, context: TypeContext, depth: number): string {
  const alias = context.aliases.get(type.name);
  if (depth < 3 && alias && isAliasOfLiterals(alias)) {
    return typeText(alias, context, depth + 1);
  }

  const args = type.typeArguments ?? [];
  if (args.length === 0) {
    return type.qualifiedName ?? type.name;
  }
  return `${type.name}<${args.map((arg) => typeText(arg, context, depth)).join(', ')}>`;
}

function isAliasOfLiterals(type: SomeType): boolean {
  return type.type === 'union' || type.type === 'literal' || type.type === 'intrinsic';
}

function reflectionText(type: ReflectionType, context: TypeContext, depth: number): string {
  const declaration = type.declaration;
  const signatures = declaration.signatures ?? [];
  if (signatures.length > 0) {
    return signatures
      .map((signature) => {
        const params = (signature.parameters ?? [])
          .map(
            (param) =>
              `${param.name}${param.flags.isOptional ? '?' : ''}: ${typeText(param.type, context, depth)}`,
          )
          .join(', ');
        return `(${params}) => ${typeText(signature.type, context, depth)}`;
      })
      .join(' | ');
  }

  const children = declaration.children ?? [];
  if (children.length > 0) {
    return `{ ${children
      .map((child) => `${child.name}${child.flags.isOptional ? '?' : ''}`)
      .join(', ')} }`;
  }

  return 'object';
}
