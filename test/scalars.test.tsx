import { ModelProperty } from '@typespec/compiler';
import { describe, it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('works with boolean', async () => {
  const runner = await createTestRunner();
  const { booleanProp } = (await runner.compile(`
      model Test {
        @test
        booleanProp: boolean,
      }
    `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={booleanProp.type} />, 'boolean');
});

it('works with string', async () => {
  const runner = await createTestRunner();
  const { stringProp, shortStringProp, urlProp, uuidProp, patternProp } =
    (await runner.compile(`
      @maxLength(10)
      @minLength(5)
      scalar shortString extends string;

      @test
      @format("uuid")
      scalar uuidProp extends string;

      @test
      @pattern("[0-9]+")
      scalar patternProp extends string;
      

      model Test {
        @test stringProp: string,
        @test shortStringProp: shortString,
        @test urlProp: url
      }
    `)) as Record<string, ModelProperty>;

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
    const runner = await createTestRunner();
    const {
      int8WithMin,
      int8WithMinMax,
      int8WithMinExclusive,
      int8WithMinMaxExclusive,
    } = (await runner.compile(`
      @test @minValue(-20) scalar int8WithMin extends int8;
      @test @minValue(-20) @maxValue(20) scalar int8WithMinMax extends int8;
      @test @minValueExclusive(2) scalar int8WithMinExclusive extends int8; 
      @test @minValueExclusive(2) @maxValueExclusive(20) scalar int8WithMinMaxExclusive extends int8;
    `)) as Record<string, ModelProperty>;
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
    const runner = await createTestRunner();
    const { int8Prop, int16Prop, int32Prop, int64Prop } =
      (await runner.compile(`
        model Test {
          @test int8Prop: int8,
          @test int16Prop: int16,
          @test int32Prop: int32,
          @test int64Prop: int64,
        }
      `)) as Record<string, ModelProperty>;

    expectRender(runner.program, <TsSchema type={int8Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={int16Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={int32Prop.type} />, 'number');
    expectRender(runner.program, <TsSchema type={int64Prop.type} />, 'number');
  });

  it('works with unsigned integers', async () => {
    const runner = await createTestRunner();
    const { uint8Prop, uint16Prop, uint32Prop, uint64Prop, safeintProp } =
      (await runner.compile(`
      model Test {
        @test uint8Prop: uint8,
        @test uint16Prop: uint16,
        @test uint32Prop: uint32,
        @test uint64Prop: uint64,
        @test safeintProp: safeint,
      }
    `)) as Record<string, ModelProperty>;

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
    const runner = await createTestRunner();
    const { float32Prop, float64Prop, floatProp } = (await runner.compile(`
        model Test {
          @test float32Prop: float32,
          @test float64Prop: float64,
          @test floatProp: float,
        }
      `)) as Record<string, ModelProperty>;

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
    const runner = await createTestRunner();
    const { decimalProp, decimal128Prop } = (await runner.compile(`
        model Test {
          @test decimalProp: decimal,
          @test decimal128Prop: decimal128,
        }
      `)) as Record<string, ModelProperty>;

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
  const runner = await createTestRunner();
  const { bytesProp } = (await runner.compile(`
      model Test {
        @test bytesProp: bytes,
      }
    `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={bytesProp.type} />, 'any');
});

it('works with date things', async () => {
  const runner = await createTestRunner();
  const { plainDateProp, plainTimeProp, utcDateTimeProp, offsetDateTimeProp } =
    (await runner.compile(`
      model Test {
        @test plainDateProp: plainDate,
        @test plainTimeProp: plainTime,
        @test utcDateTimeProp: utcDateTime,
        @test offsetDateTimeProp: offsetDateTime
      }
    `)) as Record<string, ModelProperty>;

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
  const runner = await createTestRunner();
  const {
    int32Date,
    int64Date,
    rfc3339DateUtc,
    rfc3339DateOffset,
    rfc7231DateUtc,
    rfc7231DateOffset,
  } = await runner.compile(`
      @test
      @encode(DateTimeKnownEncoding.unixTimestamp, int32)
      scalar int32Date extends utcDateTime;
      
      @test
      @encode(DateTimeKnownEncoding.unixTimestamp, int64)
      scalar int64Date extends utcDateTime;

      @test
      @encode(DateTimeKnownEncoding.rfc3339)
      scalar rfc3339DateUtc extends utcDateTime;

      @test
      @encode(DateTimeKnownEncoding.rfc3339)
      scalar rfc3339DateOffset extends offsetDateTime;
      
      @test
      @encode(DateTimeKnownEncoding.rfc7231)
      scalar rfc7231DateUtc extends utcDateTime;

      @test
      @encode(DateTimeKnownEncoding.rfc7231)
      scalar rfc7231DateOffset extends offsetDateTime;
    `);

  expectRender(runner.program, <TsSchema type={int32Date} />, 'string');
  expectRender(runner.program, <TsSchema type={int64Date} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc3339DateUtc} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc3339DateOffset} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc7231DateUtc} />, 'string');
  expectRender(runner.program, <TsSchema type={rfc7231DateOffset} />, 'string');
});

it('works with durations and encodings', async () => {
  const runner = await createTestRunner();
  const { myDuration, isoDuration, secondsDuration, int64SecondsDuration } =
    await runner.compile(`
      @test
      @encode(DurationKnownEncoding.ISO8601)
      scalar isoDuration extends duration;

      @test
      @encode(DurationKnownEncoding.seconds, int32)
      scalar secondsDuration extends duration;
      
      @test
      @encode(DurationKnownEncoding.seconds, int64)
      scalar int64SecondsDuration extends duration;

      @test
      scalar myDuration extends duration;
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
  const runner = await createTestRunner();
  const { myScalar, myAdditionalScalar } = (await runner.compile(`
    @maxLength(10)
    @test scalar myScalar extends string;

    @minLength(5)
    @test scalar myAdditionalScalar extends myScalar;
  `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={myScalar} />, 'string');
  expectRender(
    runner.program,
    <TsSchema type={myAdditionalScalar} />,
    'string',
  );
});

it('works with unknown scalars', async () => {
  const runner = await createTestRunner();
  const { unknownScalar } = (await runner.compile(`
      @test scalar unknownScalar;
    `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={unknownScalar} />, 'any');
});
it('emits docs', async () => {
  const runner = await createTestRunner();
  const { unknownScalar } = (await runner.compile(`
      /** An unknown scalar */
      @test scalar unknownScalar;
    `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={unknownScalar} />, 'any');
});
