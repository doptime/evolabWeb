## https://arxiv.org/html/2410.02725v1
Adaptive Inference-Time Compute: LLMs Can Predict if They Can Do Better, Even Mid-Generation

论文中的自适应推理和自我评估方法需要多个 Prompt 模板来触发模型的自我评估和采样策略。以下是可能的几个 Prompt 模板：

### 1. **自我评估 Prompt**
用于模型在生成过程中判断当前生成质量，决定是否继续生成或重新开始生成。

**Prompt：**
```
"Based on the current response, do you think you can produce a better result if you restart? Answer 'Yes' or 'No'."
```

**目标 Token：**
- `"Yes"` 表示模型认为可以通过重新生成得到更好结果。
- `"No"` 表示模型认为当前生成已接近最佳，不需要再重新生成。

### 2. **样本选择 Prompt**
用于模型在多个候选生成结果中选择最佳样本时的自我判断。

**Prompt：**
```
"Given the following responses, which one do you think is the best fit for the given prompt? Response 1, Response 2, ...? Please choose the most suitable option."
```

**目标 Token：**
- 对应每个候选生成结果的编号，例如 `"Response 1"`、`"Response 2"` 等。

### 3. **动态采样控制 Prompt**
用于模型在动态采样过程中判断是否需要更多采样（适用于自适应采样）。

**Prompt：**
```
"Do you think more responses are needed for a better result? Please answer 'More' or 'Enough'."
```

**目标 Token：**
- `"More"` 表示模型认为需要生成更多样本。
- `"Enough"` 表示当前样本已经足够，不再需要生成。

### 4. **中途剪枝 Prompt**
在生成过程中用于判断某个部分生成是否值得继续（用于提前剪枝策略）。

**Prompt：**
```
"Based on the current partial response, do you think this response is likely to yield a high-quality completion? Answer 'Yes' or 'No'."
```

**目标 Token：**
- `"Yes"` 表示当前生成值得继续。
- `"No"` 表示当前生成不值得继续，可以剪枝。

### 5. **候选排序 Prompt**
用于 Best-of-N 采样中的候选结果排序。

**Prompt：**
```
"Rank the following responses in terms of relevance and quality for the given input prompt: Response 1, Response 2, ..., Response N. Use rankings such as '1st', '2nd', ..., 'Nth'."
```

**目标 Token：**
- `"1st"`、`"2nd"` 等对应排序的结果。

### 6. **生成后评价 Prompt**
用于模型生成完整结果后对整体效果进行判断和评分。

**Prompt：**
```
"Evaluate the quality of the given response on a scale of 1-10, where 1 is poor and 10 is excellent. What score would you give this response?"
```

**目标 Token：**
- `"1"` 到 `"10"` 之间的数字，表示对生成结果的评分。

### 7. **生成风格调整 Prompt**
用于模型在采样过程中调整生成风格或策略（例如，平衡创造性和准确性）。

**Prompt：**
```
"Should the next response focus more on creativity or accuracy? Please answer 'Creativity' or 'Accuracy'."
```

**目标 Token：**
- `"Creativity"` 表示模型在接下来的生成中应该更注重多样性和创造性。
- `"Accuracy"` 表示模型应该更关注生成内容的准确性和一致性。

这些 Prompt 模板可以灵活组合使用，帮助模型在不同阶段进行自我判断，从而实现更智能的推理计算分配策略。