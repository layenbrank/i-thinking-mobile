/**
 * Mirrors gateway SSE delta extraction for unit coverage.
 */
function parseSseDelta(payload: string) {
  if (!payload || payload === '[DONE]') {
    return ''
  }
  try {
    const json = JSON.parse(payload) as {
      choices?: { delta?: { content?: string } }[]
    }
    return json.choices?.[0]?.delta?.content ?? ''
  } catch {
    return ''
  }
}

describe('gateway sse parsing', () => {
  test('reads delta content', () => {
    expect(parseSseDelta('{"choices":[{"delta":{"content":"你好"}}]}')).toBe('你好')
    expect(parseSseDelta('[DONE]')).toBe('')
  })

  test('ignores malformed payloads', () => {
    expect(parseSseDelta('{')).toBe('')
  })
})
