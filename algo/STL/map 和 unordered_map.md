
# C++ STL: map vs unordered_map 深度对比

## 1. 核心区别速查表

| 特性 | std::map | std::unordered_map |
| :--- | :--- | :--- |
| **底层实现** | **红黑树** (Red-Black Tree) | **哈希表** (Hash Table) |
| **是否有序** | **有序** (按 Key 升序/自定义排序) | **无序** (顺序不可预测) |
| **查找复杂度** | 平均 $O(\log n)$，最坏 $O(\log n)$ | 平均 $O(1)$，最坏 $O(n)$ (哈希冲突) |
| **插入/删除** | $O(\log n)$ | 平均 $O(1)$ |
| **空间占用** | 较高 (每个节点存储父/子指针 + 颜色位) | 较高 (哈希表预留 buckets + 链表指针) |
| **迭代器失效** | 插入不失效，删除仅失效当前迭代器 | **Rehash 时全部失效** |
| **Key 要求** | 必须定义 `<` 运算符 (或自定义比较器) | 必须定义 `==` 和 `Hash` 函数 |
| **适用场景** | 需要顺序遍历、范围查询 (lower_bound) | 只需要快速查找，不在乎顺序 |

## 2. 详细解析

### std::map
* **特性**：基于红黑树（一种平衡二叉搜索树）。所有元素会自动根据 Key 排序。
* **优点**：
    * 始终有序。
    * 支持范围查找（如“查找大于 5 的第一个元素” `lower_bound`）。
    * 没有哈希冲突问题，性能极其稳定。
* **缺点**：
    * 速度比 Hash 慢，尤其是数据量大时。

### std::unordered_map (C++11)
* **特性**：基于 Bucket 数组 + 链表（或红黑树，视实现而定）解决冲突。
* **优点**：
    * **快！** 在数据分布均匀时，增删改查都是 $O(1)$。
* **缺点**：
    * 哈希函数设计不好会导致性能退化到 $O(n)$。
    * 建立哈希表有初始开销（分配 bucket 内存）。
    * 扩容（Rehash）时代价巨大。

## 3. 代码用法对比

### 一、`map` 常见用法

#### 1. 创建与初始化
```cpp
#include <iostream>
#include <map>
#include <string>

// 1.1 空map
std::map<int, std::string> m1;

// 1.2 列表初始化（C++11）
std::map<int, std::string> m2 = {
    {1, "one"},
    {2, "two"},
    {3, "three"}
};

// 1.3 拷贝构造
std::map<int, std::string> m3(m2);
```

#### 2. 插入元素
```cpp
// 2.1 使用[]运算符（key不存在会创建）
m1[10] = "ten";  // m1[10]已存在则覆盖

// 2.2 insert()方法
m1.insert({20, "twenty"});  // 返回pair<iterator, bool>
m1.insert({10, "TEN"});     // key=10已存在，不会覆盖

// 2.3 insert或赋值
m1[10] = "new_ten";  // 会覆盖旧值

// 2.4 emplace()原地构造（C++11）
m1.emplace(30, "thirty");  // 比insert更高效
```

#### 3. 访问元素
```cpp
// 3.1 []运算符（不检查key是否存在）
std::string s = m2[1];  // 返回"one"
std::string s2 = m2[100]; // key不存在，创建空string并返回

// 3.2 at()（key不存在抛异常）
try {
    std::string s3 = m2.at(1);    // 安全访问
    std::string s4 = m2.at(100);  // 抛出std::out_of_range
} catch (const std::out_of_range& e) {
    std::cout << "Key not found" << std::endl;
}
```

#### 4. 查找元素
```cpp
// 4.1 find()（推荐）
auto it = m2.find(2);
if (it != m2.end()) {
    std::cout << "Found: " << it->first << "->" << it->second << std::endl;
} else {
    std::cout << "Not found" << std::endl;
}

// 4.2 count()（判断存在性）
if (m2.count(2)) {  // 返回0或1（map键唯一）
    std::cout << "Key exists" << std::endl;
}
```

#### 5. 删除元素
```cpp
// 5.1 erase(key)
m2.erase(2);  // 删除key=2的元素，返回删除数量

// 5.2 erase(iterator)
auto it = m2.find(1);
if (it != m2.end()) {
    m2.erase(it);  // 删除迭代器指向元素
}

// 5.3 clear()
m2.clear();  // 清空所有元素
```

#### 6. 遍历
```cpp
// 6.1 范围for循环（C++11）
for (const auto& p : m3) {
    std::cout << p.first << ":" << p.second << " ";
}

// 6.2 迭代器遍历
for (auto it = m3.begin(); it != m3.end(); ++it) {
    std::cout << it->first << ":" << it->second << " ";
}

// 6.3 反向遍历
for (auto it = m3.rbegin(); it != m3.rend(); ++it) {
    std::cout << it->first << ":" << it->second << " ";
}
```

#### 7. 大小与判断
```cpp
std::map<int, int> m = {{1,2}, {3,4}};
std::cout << "Size: " << m.size() << std::endl;      // 2
std::cout << "Empty: " << m.empty() << std::endl;    // false
std::cout << "Count of 1: " << m.count(1) << std::endl;  // 1
```

#### 8. 范围查询（map特有优势）
```cpp
// 8.1 lower_bound(key) - 第一个≥key的迭代器
auto it = m3.lower_bound(2);  // 返回key=2或3的迭代器

// 8.2 upper_bound(key) - 第一个>key的迭代器
auto it2 = m3.upper_bound(2); // 返回key=3的迭代器

// 8.3 equal_range(key) - 返回pair<lower_bound, upper_bound>
auto range = m3.equal_range(2);
```

---

### 二、`unordered_map` 常见用法

#### 1. 创建与初始化
```cpp
#include <iostream>
#include <unordered_map>
#include <string>

// 1.1 空unordered_map
std::unordered_map<std::string, int> um1;

// 1.2 列表初始化
std::unordered_map<std::string, int> um2 = {
    {"apple", 5},
    {"banana", 3},
    {"orange", 8}
};

// 1.3 指定桶数量提升性能
std::unordered_map<int, int> um3(10000);  // 预分配10000个桶
```

#### 2. 插入与访问
```cpp
// 2.1 []运算符（最常用）
um1["apple"] = 10;       // 插入或更新
um1["grape"]++;          // 不存在则创建并初始化为0，再++

// 2.2 insert()
um1.insert({"mango", 7});

// 2.3 emplace()（推荐，更高效）
um1.emplace("pear", 4);

// 2.4 at()
int count = um2.at("apple");  // 返回5
```

#### 3. 查找与删除
```cpp
// 3.1 find()（推荐）
if (um2.find("apple") != um2.end()) {
    std::cout << "Apple exists" << std::endl;
}

// 3.2 count()
if (um2.count("banana")) {
    std::cout << "Banana count: " << um2["banana"] << std::endl;
}

// 3.3 erase()
um2.erase("apple");  // 删除key

// 3.4 clear()
um2.clear();
```

#### 4. 遍历
```cpp
// 4.1 范围for（无序，每次顺序可能不同）
for (const auto& p : um2) {
    std::cout << p.first << ":" << p.second << " ";
}

// 4.2 迭代器遍历
for (auto it = um2.begin(); it != um2.end(); ++it) {
    std::cout << it->first << "->" << it->second << std::endl;
}
```

#### 5. 性能相关操作
```cpp
// 5.1 查看负载因子
std::cout << "Load factor: " << um2.load_factor() << std::endl;

// 5.2 预留空间避免重哈希
um2.reserve(1000);  // 预分配1000个桶

// 5.3 查看桶数量
std::cout << "Bucket count: " << um2.bucket_count() << std::endl;

// 5.4 重新哈希
um2.rehash(2000);  // 设置桶数量≥2000
```

#### 6. 处理哈希冲突（自定义哈希函数）
```cpp
// 示例：为pair<int, int>定义unordered_map
struct PairHash {
    size_t operator()(const std::pair<int, int>& p) const {
        return std::hash<int>()(p.first) ^ std::hash<int>()(p.second);
    }
};

std::unordered_map<std::pair<int, int>, int, PairHash> custom_um;
custom_um[{1, 2}] = 10;
```

---

### 三、对比使用场景

#### 优先用 `map` 的情况：
```cpp
// 需要有序时
std::map<int, std::string> scores = {{100, "A"}, {90, "B"}, {80, "C"}};
// 自动按分数排序，方便范围查询
auto it = scores.lower_bound(85);  // 找第一个≥85的分数
```

#### 优先用 `unordered_map` 的情况：
```cpp
// 高频查找时
std::unordered_map<std::string, int> word_freq;
for (const auto& word : words) {
    ++word_freq[word];  // O(1)平均复杂度
}
```


## 4. 常见面试题/坑点

1. **如果要用自定义结构体做 Key：**
    - `map`：需要在结构体内部重载 `operator<`。
    - `unordered_map`：需要重载 `operator==` **并且** 特化 `std::hash` 模板。
2. **迭代器失效：**
    - 在 `unordered_map` 中插入元素可能触发扩容 (Rehash)，导致**所有迭代器失效**。而在 `map` 中插入元素绝对不会影响其他元素的迭代器。
