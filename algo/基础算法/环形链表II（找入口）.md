
# [142] 环形链表 II (Linked List Cycle II)

> **标签**：`链表` `双指针` `数学`  
> **难度**：🟡 Medium

## 🧠 核心思维：两阶段法 (Two-Phase Algorithm)

这是一道经典的数学推理题，不能靠直觉盲猜。解法分为两个精确的阶段：

1.  **阶段一 (判环)**：使用快慢指针判断是否有环（同 141 题）。
2.  **阶段二 (找入口)**：一旦相遇，利用数学性质 **$a = c$** 精确定位入口。

```mermaid
graph LR
    H((Head)) -- "a (直线)" --> E((Entry))
    subgraph Cycle [环形区域]
        E -- "b (环内段1)" --> M((Meet))
        M -- "c (环内段2)" --> E
    end
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style M fill:#bbf,stroke:#333,stroke-width:2px
````

> [!IMPORTANT]
> 
> 操作口诀：
> 
> 1. **相遇即停**：当 `fast` 和 `slow` 第一次相遇时，立刻暂停。
>     
> 2. **龟回起点**：把慢指针 `slow` 扔回链表起点 `head`。
>     
> 3. **同速前进**：`fast` 留在原地，两人改为**每次走 1 步**。
>     
> 4. **路口相见**：当他们再次相遇时，所在的那个节点就是**环的入口**。
>     

---

## 💻 标准代码 (C++)

```cpp
ListNode *detectCycle(ListNode *head) {
    ListNode *slow = head;
    ListNode *fast = head;
    
    // 1. 阶段一：判断是否有环
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        
        // 发现相遇！
        if (slow == fast) {
            // 2. 阶段二：寻找入口
            slow = head; // 🐢 让 slow 回家 (回到起点)
            
            // 两个人都一步一步走 (注意 fast 也要降速！)
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            // 再次相遇点即为入口
            return slow; 
        }
    }
    return nullptr;
}
```

---

## 📐 深度解析：为什么这样做是对的？

很多初学者卡在这里：_为什么把 slow 扔回起点再一起走，它俩就一定会在入口相遇？_

### 1. 变量定义 (请配合上方图解)

- **$a$**：从 `Head` 到 `环入口 Entry` 的直线距离。
- **$b$**：从 `Entry` 到 `相遇点 Meet` 的距离。
- **$c$**：从 `Meet` 继续绕一圈回到 `Entry` 的距离。
    - _(注：环的总长度 $L = b + c$)_

### 2. 建立速度等式

当快慢指针在 `Meet` 点相遇时：

- **慢指针 (Slow)** 走的距离：$S_{slow} = a + b$
- **快指针 (Fast)** 走的距离：$S_{fast} = a + b + n(b + c)$
    - _(注：兔子跑得快，可能已经在圈里多跑了 $n$ 圈)_

> [!NOTE]
> 
> Q: 为什么慢指针 slow 走的距离一定是 $a+b$，而不是 $a+b+L$ (多跑一圈)?
> 
> A: 因为 $V_{fast} = 2 \times V_{slow}$。
> 
> 当乌龟刚进环时，兔子已经在环里了。兔子追上乌龟只需要跑不到一圈的距离（极限情况是兔子就在乌龟身后）。在兔子跑这一圈的时间里，乌龟只能跑半圈。
> 
> 结论：乌龟在第一次相遇前，绝不可能跑完一整圈。

### 3. 化简推导 (见证奇迹)

因为 $V_{fast} = 2V_{slow}$，所以 $S_{fast} = 2S_{slow}$：

$$2(a + b) = a + b + n(b + c)$$

我们解一下这个方程，目标是算出 **$a$** (起点到入口的距离)：

1. **消元**：$2a + 2b = a + b + n(b + c) \implies a + b = n(b + c)$
2. **移项**：$a = n(b + c) - b$
3. **变形技巧**：
    - 把 $n$ 圈拆成 `(n-1)圈` + `最后1圈`。
    - 公式变为：$a = (n - 1)(b + c) + \underbrace{(b + c) - b}_{=c}$

### 4. 最终结论

忽略掉多转的圈数 $(n-1)(b+c)$（因为转整圈对位置没有影响），我们得到了核心等式：

> [!TIP]
> 
> $$a = c$$
> 
> 人话翻译：
> 
> 站在“起点”往后看 (距离 $a$)，和站在“相遇点”往后看 (距离 $c$)，到达“环入口”的距离是完全一样的！

所以，一个从起点走，一个从相遇点走，只要速度一样，必然同时踩中入口。



<LC142CycleAnimation />