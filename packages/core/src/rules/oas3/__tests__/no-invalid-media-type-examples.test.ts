import { outdent } from 'outdent';
import { lintDocument } from '../../../lint';
import { parseYamlToDocument, replaceSourceWithRef, makeConfig } from '../../../../__tests__/utils';
import { BaseResolver } from '../../../resolve';

describe('no-invalid-media-type-examples', () => {
  it('should report on invalid example', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      example:
                        a: 13
                        b: "string"
                      schema:
                        type: object
                        properties:
                          a:
                            type: string
                          b:
                            type: number

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({ 'no-invalid-media-type-examples': 'error' }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`
      Array [
        Object {
          "from": Object {
            "pointer": "#/paths/~1pet/get/responses/200/content/application~1json",
            "source": "foobar.yaml",
          },
          "location": Array [
            Object {
              "pointer": "#/paths/~1pet/get/responses/200/content/application~1json/example/a",
              "reportOnKey": false,
              "source": "foobar.yaml",
            },
          ],
          "message": "Example value must conform to the schema: \`a\` property type must be string.",
          "ruleId": "no-invalid-media-type-examples",
          "severity": "error",
          "suggest": Array [],
        },
        Object {
          "from": Object {
            "pointer": "#/paths/~1pet/get/responses/200/content/application~1json",
            "source": "foobar.yaml",
          },
          "location": Array [
            Object {
              "pointer": "#/paths/~1pet/get/responses/200/content/application~1json/example/b",
              "reportOnKey": false,
              "source": "foobar.yaml",
            },
          ],
          "message": "Example value must conform to the schema: \`b\` property type must be number.",
          "ruleId": "no-invalid-media-type-examples",
          "severity": "error",
          "suggest": Array [],
        },
      ]
    `);
  });

  it('should report on invalid example with disallowAdditionalProperties', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      example:
                        a: "string"
                        b: 13
                        c: unknown
                      schema:
                        type: object
                        properties:
                          a:
                            type: string
                          b:
                            type: number

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({
        'no-invalid-media-type-examples': {
          severity: 'error',
          disallowAdditionalProperties: true,
        },
      }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`
      Array [
        Object {
          "from": Object {
            "pointer": "#/paths/~1pet/get/responses/200/content/application~1json",
            "source": "foobar.yaml",
          },
          "location": Array [
            Object {
              "pointer": "#/paths/~1pet/get/responses/200/content/application~1json/example/c",
              "reportOnKey": true,
              "source": "foobar.yaml",
            },
          ],
          "message": "Example value must conform to the schema: must NOT have additional properties \`c\`.",
          "ruleId": "no-invalid-media-type-examples",
          "severity": "error",
          "suggest": Array [],
        },
      ]
    `);
  });

  it('should not on invalid example with disallowAdditionalProperties', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      example:
                        a: "string"
                        b: 13
                      schema:
                        type: object
                        properties:
                          a:
                            type: string
                          b:
                            type: number

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({
        'no-invalid-media-type-examples': {
          severity: 'error',
          disallowAdditionalProperties: true,
        },
      }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`Array []`);
  });

  it('should not on invalid examples', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        components:
          examples:
            test:
              value:
                a: 23
                b: 25
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      examples:
                        test:
                          $ref: '#/components/examples/test'
                        test2:
                          value:
                            a: test
                            b: 35
                      schema:
                        type: object
                        properties:
                          a:
                            type: string
                          b:
                            type: number

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({
        'no-invalid-media-type-examples': {
          severity: 'error',
          disallowAdditionalProperties: true,
        },
      }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`
      Array [
        Object {
          "from": Object {
            "pointer": "#/paths/~1pet/get/responses/200/content/application~1json",
            "source": "foobar.yaml",
          },
          "location": Array [
            Object {
              "pointer": "#/components/examples/test/value/a",
              "reportOnKey": false,
              "source": "foobar.yaml",
            },
          ],
          "message": "Example value must conform to the schema: \`a\` property type must be string.",
          "ruleId": "no-invalid-media-type-examples",
          "severity": "error",
          "suggest": Array [],
        },
      ]
    `);
  });

  it('should not report if no examples', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      example:
                        a: test
                        b: 35

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({ 'no-invalid-media-type-examples': 'error' }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report if no schema', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          a:
                            type: string
                          b:
                            type: number

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({ 'no-invalid-media-type-examples': 'error' }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`Array []`);
  });

  it('should work with cross-file $ref', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        components:
          schemas:
            C:
              $ref: './fixtures/common.yaml#/components/schemas/A'
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      example: {
                        "a": "test",
                        "b": "test"
                      }
                      schema:
                        $ref: '#/components/schemas/C'

      `,
      __dirname + '/foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({ 'no-invalid-media-type-examples': 'error' }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`Array []`);
  });

  it('should not throw for ajv throw', async () => {
    const document = parseYamlToDocument(
      outdent`
        openapi: 3.0.0
        paths:
          /pet:
            get:
              responses:
                200:
                  content:
                    application/json:
                      example: {}
                      schema:
                        nullable: true

      `,
      'foobar.yaml',
    );

    const results = await lintDocument({
      externalRefResolver: new BaseResolver(),
      document,
      config: await makeConfig({ 'no-invalid-media-type-examples': 'error' }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`
      Array [
        Object {
          "from": Object {
            "pointer": "#/paths/~1pet/get/responses/200/content/application~1json",
            "source": "foobar.yaml",
          },
          "location": Array [
            Object {
              "pointer": "#/paths/~1pet/get/responses/200/content/application~1json/schema",
              "reportOnKey": false,
              "source": "foobar.yaml",
            },
          ],
          "message": "Example validation errored: \\"nullable\\" cannot be used without \\"type\\".",
          "ruleId": "no-invalid-media-type-examples",
          "severity": "error",
          "suggest": Array [],
        },
      ]
    `);
  });
});
