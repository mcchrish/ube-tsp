import { Children, For, Prose, StatementList } from '@alloy-js/core';
import {
  ArrayExpression,
  InterfaceExpression,
  InterfaceMember,
} from '@alloy-js/typescript';
import { Enum, Model, Scalar, Tuple, Type, Union } from '@typespec/compiler';
import { Typekit } from '@typespec/compiler/typekit';
import { useTsp } from '@typespec/emitter-framework';
import { ValueExpression } from '@typespec/emitter-framework/typescript';
import { isDeclaration, isRecord } from '../utils.js';

interface Props {
  type: Type;
}
export function TsSchema({ type }: Props) {
  const { $ } = useTsp();
  switch (type.kind) {
    case 'Intrinsic':
      switch (type.name) {
        case 'void':
          return 'void';
        case 'null':
          return 'null';
        case 'never':
          return 'never';
        case 'unknown':
        default:
          return 'unknown';
      }
    case 'String':
      return `"${type.value}"`;
    case 'Number':
    case 'Boolean':
      return type.value.toString();
    case 'Scalar':
      return scalarBaseType($, type);
    case 'Model':
      return modelBaseType($, type);
    case 'Union':
      return unionBaseType($, type);
    case 'Enum':
      return enumBaseType(type);
    case 'ModelProperty':
      return <TsSchema type={type} />;
    case 'EnumMember':
      return type.value ? (
        <TsSchema type={$.literal.create(type.value)} />
      ) : (
        <TsSchema type={$.literal.create(type.name)} />
      );
    case 'Tuple':
      return tupleBaseType(type);
    default:
      return 'unknown';
  }
}

function scalarBaseType($: Typekit, type: Scalar) {
  if ($.scalar.extendsBoolean(type)) {
    return 'boolean';
  } else if ($.scalar.extendsNumeric(type)) {
    return 'number';
  } else if ($.scalar.extendsString(type)) {
    return 'string';
  } else if ($.scalar.extendsBytes(type)) {
    return 'any';
  } else if ($.scalar.extendsPlainDate(type)) {
    return 'string';
  } else if ($.scalar.extendsPlainTime(type)) {
    return 'string';
  } else if ($.scalar.extendsUtcDateTime(type)) {
    return 'string';
  } else if ($.scalar.extendsOffsetDateTime(type)) {
    return 'string';
  } else if ($.scalar.extendsDuration(type)) {
    return 'string';
  } else {
    return 'any';
  }
}

function modelBaseType($: Typekit, type: Model) {
  if ($.array.is(type)) {
    const elementType = <TsSchema type={type.indexer.value} />;
    return (
      <>
        {elementType}
        <ArrayExpression />
      </>
    );
  }

  let recordPart: Children | undefined;
  if (
    isRecord($.program, type) ||
    (!!type.baseModel &&
      isRecord($.program, type.baseModel) &&
      !isDeclaration($.program, type.baseModel))
  ) {
    recordPart = (
      <>
        {'Record<'}
        <TsSchema type={(type.indexer ?? type.baseModel!.indexer)!.key} />
        {', '}
        <TsSchema type={(type.indexer ?? type.baseModel!.indexer)!.value} />
        {'>'}
      </>
    );
  }

  let memberPart: Children | undefined;

  if (type.properties.size > 0) {
    memberPart = (
      <InterfaceExpression>
        <StatementList>
          {[...type.properties.values()].flatMap((property) => {
            if (property.name === 'type') {
              return [];
            }
            return (
              <InterfaceMember
                name={property.name}
                optional={property.optional || !!property.defaultValue}
                doc={
                  property.defaultValue ? (
                    <Prose>
                      {'@defaultValue `'}
                      <ValueExpression value={property.defaultValue} />
                      {'`'}
                    </Prose>
                  ) : undefined
                }
                type={<TsSchema type={property.type} />}
              />
            );
          })}
        </StatementList>
      </InterfaceExpression>
    );
  }

  if (recordPart && !memberPart) {
    return recordPart;
  } else if (!recordPart && memberPart) {
    return memberPart;
  } else if (recordPart && memberPart) {
    return (
      <For each={[memberPart, recordPart]} joiner=" & ">
        {(child) => child}
      </For>
    );
  }

  return 'unknown';
}

// TODO
function unionBaseType($: Typekit, type: Union) {
  const discriminated = $.union.getDiscriminatedUnion(type);

  if ($.union.isExpression(type) || !discriminated) {
    return (
      <For each={Array.from(type.variants.values())} joiner=" | ">
        {(variant) => <TsSchema type={variant.type} />}
      </For>
    );
  }

  const propKey = discriminated.options.discriminatorPropertyName;
  const envKey = discriminated.options.envelopePropertyName;
  return (
    <For each={Array.from(type.variants.values())} joiner=" | ">
      {(variant) => {
        if (discriminated.options.envelope === 'object') {
          const envelope = $.model.create({
            properties: {
              [propKey]: $.modelProperty.create({
                name: propKey,
                type: $.literal.create(variant.name as string),
              }),
              [envKey]: $.modelProperty.create({
                name: envKey,
                type: variant.type,
              }),
            },
          });
          return <TsSchema type={envelope} />;
        } else {
          return <TsSchema type={variant.type} />;
        }
      }}
    </For>
  );
}

function enumBaseType(type: Enum) {
  console.log(type);
  return 'unknown';
}

function tupleBaseType(type: Tuple) {
  return (
    <ArrayExpression>
      <For each={type.values} comma line>
        {(item) => <TsSchema type={item} />}
      </For>
    </ArrayExpression>
  );
}
