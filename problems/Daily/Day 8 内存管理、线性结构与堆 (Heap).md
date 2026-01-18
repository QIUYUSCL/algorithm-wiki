

# 📅 Day 8 训练复盘：内存管理、线性结构与堆 (Heap)

标签： #Cpp #Algorithm #Heap #MemoryManagement #Recursion

日期： 2026-01-18

状态： ✅ 已完成

---

## 1. C++ 核心内功：深拷贝 (Deep Copy)

> **核心目标**：解决指针悬挂 (Dangling Pointer) 和 Double Free 问题，防止浅拷贝导致的内存共用。

### 1.1 标准赋值运算符 (`operator=`) 四步走

这是 C++ 面试手写内存管理的标准模板。


```cpp
class MyString {
    char* data;
public:
    MyString& operator=(const MyString& other) {
        // 1. 自检 (Self-Check): 防止自赋值导致数据丢失
        // 必须比较地址 (&other)，而不是比较对象值
        if (this == &other) {
            return *this;
        }

        // 2. 释放 (Release): 清理旧内存
        if (data != nullptr) {
            delete[] data;
        }

        // 3. 分配 (Allocate): 申请新内存
        // 假设 other.data 不为空，严谨场景需判空
        int len = strlen(other.data);
        data = new char[len + 1];

        // 4. 拷贝 (Copy): 搬运数据
        strcpy(data, other.data);

        // 5. 返回 (Return): 返回对象引用，支持链式赋值 (a = b = c)
        return *this;
    }
};
```

### 🚨 易错点 (Pitfalls)

- **`this == &other`**：左边是指针，右边是对象引用，必须取地址 (`&`) 才能比较。
    
- **返回 `*this`**：不要返回 `data` 指针，要返回对象本身的引用，满足函数签名 `MyString&`。
    
- **浅拷贝陷阱**：绝对禁止写 `data = other.data`，这只是复制了指针，没有复制内存。
    

---

## 2. 线性数据结构实现细节

### 2.1 栈 (Stack) - 现代 C++ 写法

- **底层**：首选 `std::vector`。
    
- **优势**：自动扩容、RAII 自动内存管理（无需手写析构函数）、内存连续（缓存友好）。
    
- **废弃观念**：不需要维护 `base`（栈底）指针，vector 封装了所有底层细节。
    

### 2.2 循环队列 (Circular Queue)

- **核心逻辑**：利用取模运算实现数组空间的循环利用。
    
- **关键公式**：
    
    - **移动指针**：`index = (index + 1) % capacity`
        
    - **判空**：`front == rear`
        
    - **判满**：`(rear + 1) % capacity == front` （为此需要浪费 1 个空间）
        
    - **获取队尾**：`(rear - 1 + capacity) % capacity` （处理 rear=0 时的回绕）
        

### 2.3 链队列 (Linked Queue) - ☠️ 死亡陷阱

- **结构**：维护 `front` (出队) 和 `rear` (入队) 两个指针。
    
- **必挂点**：当队列**从 1 个元素变为空**时。
    
    - `pop()` 删除了 `front` 指向的节点，`front` 变为 `nullptr`。
        
    - **此时必须手动将 `rear` 置为 `nullptr`！**
        
    - 否则 `rear` 会指向一块已经被 `delete` 的内存（悬挂指针），下次 `push` 时程序崩溃。
        

---

## 3. 递归思维：反转链表 ([206])

> **口诀**：递下去是钻井，归上来是铺路。

### 核心代码解析


```cpp
ListNode* reverseList(ListNode* head) {
    if (!head || !head->next) return head; // Base Case
    
    ListNode* cur = reverseList(head->next); // 1. 递：一直钻到底，拿到接力棒(新头)
    
    head->next->next = head; // 2. 归：让后一个节点指向自己 (反转指向)
    head->next = nullptr;    // 3. 断：断开原来的指向，防止成环
    
    return cur; // 4. 传：接力棒(新头)不动，一层层传回地面
}
```

- **接力棒 (`cur`)**：永远指向原链表的最后一个节点（新链表的头），在回溯过程中**值从未改变**。
    

---

## 4. 核心新知：堆与优先队列 (Heap / Priority Queue)

### 4.1 核心概念

- **物理结构**：数组 (`vector`)。
    
- **逻辑结构**：完全二叉树。
    
- **STL 容器**：`std::priority_queue` (属于容器适配器，Container Adapter)。
    
- **特性**：**不支持遍历 (`for-loop`)**，因为堆序不是排序，遍历无意义且破坏封装。
    

### 4.2 语法模版 (背诵)

|**场景**|**堆类型**|**STL 写法**|**堆顶 top()**|
|---|---|---|---|
|**求前 K 小**|大顶堆|`priority_queue<int>` (默认)|最大值|
|**求前 K 大**|小顶堆|`priority_queue<int, vector<int>, greater<int>>`|最小值|

> **记忆法则**：找大用小，找小用大。我们要维护一个 VIP 房间，把最弱的（堆顶）踢出去，留下的就是最强的。

### 4.3 经典实战策略

#### 场景 A：数组中的第 K 个最大元素 ([215])

- **策略**：维护一个大小为 `K` 的**小顶堆**。
    
- **流程**：
    
    1. 元素入堆。
        
    2. 如果 `size > k`，`pop()` 堆顶（踢出当前 K 个里最小的）。
        
    3. 最后堆顶就是第 K 大。
        
- **空间复杂度**：$O(K)$。优于全局排序的 $O(N)$ 空间。
    

#### 场景 B：前 K 个高频元素 ([347])

- **难点**：需要根据“频率”排序，但要保留“原始数字”。
    
- **组合拳**：`HashMap` (统计频率) + `PriorityQueue` (筛选 Top K)。
    
- **数据结构**：`pair<int, int>`
    
    - **技巧**：将**频率**放在 `pair.first`。
        
    - **原因**：`priority_queue` 默认比较 `first`，这样能自动按频率排序。
        
- **代码片段**：
    
    
    ```cpp
    // 小顶堆，存 <频率, 数字>
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;
    for (auto& it : map) {
        heap.push({it.second, it.first}); // 频率放前面！
        if (heap.size() > k) heap.pop();
    }
    ```
    

---

## 5. Day 8 总结与反思

### 💡 易错点清单 (Checklist)

1. [ ] **深拷贝**：`operator=` 里忘了检查 `this == &other`，或者返回值写成了 `return data`。
    
2. [ ] **链队列**：`pop()` 时忘了处理 `rear` 指针的悬挂问题。
    
3. [ ] **循环队列**：判满公式写错，忘了 `(rear + 1) % capacity`。
    
4. [ ] **优先队列**：
    
    - 想用 `for(auto x : pq)` 遍历，导致报错。
        
    - **找第 K 大**误用了**大顶堆**（那是找第 K 小用的）。
        
    - [347]题中，放入堆的是 `{数字, 频率}` 导致按数字排序而不是按频率排序。
        
