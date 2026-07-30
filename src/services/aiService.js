const API_ENDPOINT = "/api/chat"

async function callDeepSeek(input) {
  const apiKey = localStorage.getItem("openai_api_key")
  if (!apiKey) {
    throw new Error("请先在设置中配置 DeepSeek API Key")
  }

  let targetUrl = localStorage.getItem("proxy_url") || API_ENDPOINT

  const systemPrompt =
    "你是一位资深 AI 产品经理和产品策略分析师。请分析用户提供的产品想法，生成结构化的产品洞察报告，请严格按照以下 JSON 格式输出（只输出 JSON，不要包含其他文字）：\n" +
    "{\"marketAnalysis\":{\"summary\":\"市场概述（中文）\",\"tam\":\"TAM 总可寻址市场规模数据（中文）\",\"sam\":\"SAM 可服务市场规模数据（中文）\",\"som\":\"SOM 可获取市场规模数据（中文）\",\"trends\":[{\"title\":\"趋势标题（中文）\",\"description\":\"趋势描述（中文）\"}],\"competitors\":[{\"name\":\"竞品名称（中文）\",\"strength\":\"优势（中文）\",\"weakness\":\"劣势（中文）\"}]},\n" +
    "\"userPersonas\":[{\"name\":\"姓名\",\"age\":\"年龄\",\"role\":\"角色（中文）\",\"background\":\"背景描述（中文）\",\"goals\":[\"目标1（中文）\",\"目标2（中文）\"],\"painPoints\":[\"痛点1（中文）\",\"痛点2（中文）\"]}],\n" +
    "\"featurePrioritization\":[{\"feature\":\"功能名称（中文）\",\"description\":\"功能描述（中文）\",\"rice\":{\"reach\":1,\"impact\":1,\"confidence\":1,\"effort\":1},\"score\":1}],\n" +
    "\"mvpScope\":[{\"phase\":\"阶段名称（中文）\",\"features\":[\"功能1（中文）\",\"功能2（中文）\"],\"goal\":\"目标描述（中文）\"}],\n" +
    "\"successMetrics\":{\"okrs\":[{\"objective\":\"目标（中文）\",\"keyResults\":[\"关键结果1（中文）\",\"关键结果2（中文）\"]}],\"kpis\":[{\"metric\":\"指标名称（中文）\",\"target\":\"目标值\",\"unit\":\"单位\"}]}}"

  const userMessage =
    "请分析以下产品想法，**请用中文回复**：\n" +
    "产品描述：" + (input.productIdea || "未提供") + "\n" +
    "目标用户：" + (input.targetUsers || "未指定") + "\n" +
    "要解决的痛点：" + (input.painPoints || "未指定") + "\n" +
    "所属行业：" + (input.industry || "未指定")

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errData = await response.text()
      throw new Error("API error (" + response.status + "): " + errData)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    return JSON.parse(content)
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      throw new Error("API 连接失败，请检查网络或代理设置")
    }
    throw err
  }
}

export async function analyzeProduct(input) {
  return await callDeepSeek(input)
}
