import { beforeEach, describe, it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { Tester, expectRender } from './utils.jsx';
import { t, type TesterInstance } from '@typespec/compiler/testing';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('works with boolean', async () => {
  const { booleanProp } = await runner.compile(t.code`
      model Test {
        ${t.modelProperty('booleanProp')}: boolean,
      }
    `);

  expectRender(runner.program, <TsSchema type={booleanProp.type} />, 'boolean');
});

it('works with string', async () => {
  const { stringProp, shortStringProp, urlProp, uuidProp, patternProp } =
    await runner.compile(t.code`
      @maxLength(10)
      @minLength(5)
      scalar shortString extends string;

      @format("uuid")
      scalar ${t.scalar('uuidProp')} extends string;

      @pattern("[0-9]+")
      scalar ${t.scalar('patternProp')} extends string;
      

      model Test {
        ${t.modelProperty('stringProp')}: string,
        ${t.modelProperty('shortStringProp')}: shortString,
        ${t.modelProperty('urlProp')}: url
      }
    `);

  expectRender(runner.program, <TsSchema type={stringProp.type} />, 'string');
  expectRender(
    runner.program,
    <TsSchema type={shortStringProp.type} />,
    'string',
  );
  expectRender(runner.program, <TsSchema type={urlProp.type} />, 'string');
  expectRender(runner.program, <TsSchema type={uuidProp} />, 'string');
  expectRender(runner.program, <TsSchema type={patternProp} />, 'string');
});

describe('numerics', () => {
  it('handles numeric constraints', async () => {
    const {
      int8WithMin,
      int8WithMinMax,
      int8WithMinExclusive,
      int8WithMinMaxExclusive,
    } = await runner.compile(t.code`
      @minValue(-20)
      scalar ${t.scalar('int8WithMin')} extends int8;

      @minValue(-20)
      @maxValue(20)
      scalar ${t.scalar('int8WithMinMax')} extends int8;

      @minValueExclusive(2)
      scalar ${t.scalar('int8WithMinExclusive')} extends int8; 

      @minValueExclusive(2)
      @maxValueExclusive(20)
      scalar ${t.scalar('int8WithMinMaxExclusive')} extends int8;
    `);
    expectRender(runner.program, <TsSchema type={int8WithMin} />, 'number');
    expectRender(runner.program, <TsSchema type={int8WithMinMax} />, 'number');
    expectRender(
      runner.program,
      <TsSchema type={int8WithMinExclusive} />,
      'number',
    );
    expectRender(
      runner.program,
      <TsSchema type={int8WithMinMaxExclusive} />,
      'number',
    );
  });

  it('works with integers', async () => {
    const { int8Prop, int16Prop, int32Prop, int64Prop } =
      await runner.compile(t.code`
        model Test {
          ${t.modelProperty('int8Prop')}: int8,
          ${t.modelProperty('int16Prop')}: int16,
          ${t.modelProperty('int32Prop')}: int32,
          ${t.modelProperty('int64Prop')}: int64,
        }
      `);

    expectRender(runner.program, <TsSchema type={int8Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={int16Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={int32Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={int64Prop.type} />, 'number');
  });

  it('works with unsigned integers', async () => {
    const { uint8Prop, uint16Prop, uint32Prop, uint64Prop, safeintProp } =
      await runner.compile(t.code`
      model Test {
        ${t.modelProperty('uint8Prop')}: uint8,
        ${t.modelProperty('uint16Prop')}: uint16,
        ${t.modelProperty('uint32Prop')}: uint32,
        ${t.modelProperty('uint64Prop')}: uint64,
        ${t.modelProperty('safeintProp')}: safeint,
      }
    `);

    expectRender(runner.program, <TsSchema type={uint8Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={uint16Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={uint32Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={uint64Prop.type} />, 'number');
    expectRender(
      runner.program,
      <TsSchema type={safeintProp.type} />,
      'number',
    );
  });

  it('works with floats', async () => {
    const { float32Prop, float64Prop, floatProp } = await runner.compile(t.code`
        model Test {
          ${t.modelProperty('float32Prop')}: float32,
          ${t.modelProperty('float64Prop')}: float64,
          ${t.modelProperty('floatProp')}: float,
        }
      `);

    expectRender(
      runner.program,
      <TsSchema type={float32Prop.type} />,
      'number',
    );
    expectRender(
      runner.program,
      <TsSchema type={float64Prop.type} />,
      'number',
    );
    expectRender(runner.program, <TsSchema type={floatProp.type} />, 'number');
  });

  it('works with decimals', async () => {
    const { decimalProp, decimal128Prop } = await runner.compile(t.code`
        model Test {
          ${t.modelProperty('decimalProp')}: decimal,
          ${t.modelProperty('decimal128Prop')}: decimal128,
        }
      `);

    expectRender(
      runner.program,
      <TsSchema type={decimalProp.type} />,
      'number',
    );
    expectRender(
      runner.program,
      <TsSchema type={decimal128Prop.type} />,
      'number',
    );
  });
});

it('works with bytes', async () => {
  const { bytesProp } = await runner.compile(t.code`
      model Test {
        ${t.modelProperty('bytesProp')}: bytes,
      }
    `);

  expectRender(runner.program, <TsSchema type={bytesProp.type} />, 'any');
});

it('works with date things', async () => {
  const { plainDateProp, plainTimeProp, utcDateTimeProp, offsetDateTimeProp } =
    await runner.compile(t.code`
      model Test {
        ${t.modelProperty('plainDateProp')}: plainDate,
        ${t.modelProperty('plainTimeProp')}: plainTime,
        ${t.modelProperty('utcDateTimeProp')}: utcDateTime,
        ${t.modelProperty('offsetDateTimeProp')}: offsetDateTime
      }
    `);

  expectRender(
    runner.program,
    <TsSchema type={plainDateProp.type} />,
    'string',
  );
  expectRender(
    runner.program,
    <TsSchema type={plainTimeProp.type} />,
    'string',
  );
  expectRender(
    runner.program,
    <TsSchema type={utcDateTimeProp.type} />,
    'string',
  );
  expectRender(
    runner.program,
    <TsSchema type={offsetDateTimeProp.type} />,
    'string',
  );
});

it('works with dates and encodings', async () => {
  const {
    int32Date,
    int64Date,
    rfc3339DateUtc,
    rfc3339DateOffset,
    rfc7231DateUtc,
    rfc7231DateOffset,
  } = await runner.compile(t.code`
      @encode(DateTimeKnownEncoding.unixTimestamp, int32)
      scalar ${t.scalar('int32Date')} extends utcDateTime;
      
      @encode(DateTimeKnownEncoding.unixTimestamp, int64)
      scalar ${t.scalar('int64Date')} extends utcDateTime;

      @encode(DateTimeKnownEncoding.rfc3339)
      scalar ${t.scalar('rfc3339DateUtc')} extends utcDateTime;

      @encode(DateTimeKnownEncoding.rfc3339)
      scalar ${t.scalar('rfc3339DateOffset')} extends offsetDateTime;
      
      @encode(DateTimeKnownEncoding.rfc7231)
      scalar ${t.scalar('rfc7231DateUtc')} extends utcDateTime;

      @encode(DateTimeKnownEncoding.rfc7231)
      scalar ${t.scalar('rfc7231DateOffset')} extends offsetDateTime;
    `);

  expectRender(runner.program, <TsSchema type={int32Date} />, 'string');
  expectRender(runner.program, <TsSchema type={int64Date} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc3339DateUtc} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc3339DateOffset} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc7231DateUtc} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc7231DateOffset} />, 'string');
});

it('works with durations and encodings', async () => {
  const { myDuration, isoDuration, secondsDuration, int64SecondsDuration } =
    await runner.compile(t.code`
      @encode(DurationKnownEncoding.ISO8601)
      scalar ${t.scalar('isoDuration')} extends duration;

      @encode(DurationKnownEncoding.seconds, int32)
      scalar ${t.scalar('secondsDuration')} extends duration;
      
      @encode(DurationKnownEncoding.seconds, int64)
      scalar ${t.scalar('int64SecondsDuration')} extends duration;

      scalar ${t.scalar('myDuration')} extends duration;
    `);

  expectRender(runner.program, <TsSchema type={myDuration} />, 'string');
  expectRender(runner.program, <TsSchema type={isoDuration} />, 'string');
  expectRender(runner.program, <TsSchema type={secondsDuration} />, 'string');
  expectRender(
    runner.program,
    <TsSchema type={int64SecondsDuration} />,
    'string',
  );
});

it('extends declared scalars', async () => {
  const { myScalar, myAdditionalScalar } = await runner.compile(t.code`
    @maxLength(10)
    scalar ${t.scalar('myScalar')} extends string;

    @minLength(5)
    scalar ${t.scalar('myAdditionalScalar')} extends myScalar;
  `);

  expectRender(runner.program, <TsSchema type={myScalar} />, 'string');
  expectRender(
    runner.program,
    <TsSchema type={myAdditionalScalar} />,
    'string',
  );
});

it('works with unknown scalars', async () => {
  const { unknownScalar } = await runner.compile(t.code`
      scalar ${t.scalar('unknownScalar')};
    `);

  expectRender(runner.program, <TsSchema type={unknownScalar} />, 'any');
});
it('emits docs', async () => {
  const { unknownScalar } = await runner.compile(t.code`
      /** An unknown scalar */
      scalar ${t.scalar('unknownScalar')};
    `);

  expectRender(runner.program, <TsSchema type={unknownScalar} />, 'any');
});
