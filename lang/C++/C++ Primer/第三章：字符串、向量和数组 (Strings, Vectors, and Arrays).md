
# 字符串、向量和数组 (Strings, Vectors, and Arrays)

## 3.1 命名空间的 using 声明

为了避免每次都写 `std::cin`、`std::string` 这样繁琐的前缀，我们可以使用 `using` 声明。

- **语法**：`using namespace::name;`
- **示例**
    ```cpp
    using std::cin;
    using std::string;
    // 之后可以直接使用 cin 和 string
    ```

> [!WARNING] 头文件中的陷阱
> 
> 千万不要在头文件 (.h / .hpp) 中使用 using 声明！
> 
> 因为头文件会被包含到其他文件中，这会导致所有包含该头文件的代码都被迫“打开”了命名空间，极易引发命名冲突（Namespace Pollution）。

---

## 3.2 标准库类型 string

`std::string` 表示可变长的字符序列。
### 1. 定义和初始化

```cpp
string s1;            // 默认初始化，空字符串
string s2 = s1;       // 拷贝初始化，使用等号
string s3 = "hiya";   // 拷贝初始化
string s4(10, 'c');   // 直接初始化，s4 内容为 "cccccccccc"
```
### 2. 读写操作

- **`cin >> s`**：**自动忽略**开头的空白（空格、换行、制表符），从第一个真字符读起，直到遇到下一个空白停止。
- **`getline(cin, s)`**：读取**一整行**，保留空格，直到遇到换行符为止（换行符被读取但不存入 string）。
### 3. 核心操作

- `s.empty()`：布尔值，是否为空。
- `s.size()`：返回字符个数。

> [!TIP]  size_type 类型
> s.size() 返回的类型不是 int，而是 string::size_type。这是一个无符号类型，且足以容纳任何 string。
> 
> 切记：不要在表达式中混用 size() 和 int（特别是负数），因为无符号数和有符号数运算会产生意想不到的结果。

- **比较**：`==`, `!=`, `<`, `<=` 等（字典序比较）。
- **相加**：`s1 + s2`。
    - **注意**：字面值不能直接相加。`"hello" + "world"` ❌ 是错误的，必须确保 `+` 两侧至少有一个是 string 对象。

### 4. 处理字符 (cctype 头文件)

利用 C++11 的 **范围 for 循环 (Range-based for)** 遍历字符：

```cpp
string str = "Hello World";
// 将所有字符变大写
for (auto &c : str) { // 注意这里使用了引用 &，否则无法修改原字符串
    c = toupper(c);
}
```

---
## 3.3 标准库类型 vector

`std::vector` 是一个**类模板 (Class Template)**，表示对象的集合。它也被称为**容器**。
### 1. 定义和初始化


```cpp
vector<int> v1;               // 默认初始化，空
vector<int> v2(v1);           // 拷贝
vector<int> v3(10, 1);        // 10 个元素，每个都是 1
vector<int> v4{1, 2, 3};      // 列表初始化 (C++11)
vector<string> v5(10, "hi");  // 10 个 "hi"
```

> [!NOTE] 圆括号 () vs 花括号 {}
> 
> - `vector<int> v(10);` -> 构建 10 个默认初始化的 int（都是 0）。
>     
> - `vector<int> v{10};` -> 构建 1 个 int，值为 10。
>     

### 2. 向 vector 添加元素

- **`push_back(val)`**：把元素压入尾部。
- **关键原则**：在现代 C++ 中，通常先定义一个空 vector，然后运行时动态 push_back，这比预先分配指定大小往往更高效。
    

### 3. 其他操作

- `v.size()`：返回 `vector<T>::size_type`。
- `v[n]`：下标索引。
    

> [!WARNING] 致命错误：下标越界
> 
> 不能使用下标来添加元素！下标只能访问已存在的元素。
> 
> C++
> 
> ```
> vector<int> ivec; // 空
> ivec[0] = 42;     // ❌ 运行时错误！缓冲区溢出 (Buffer Overflow)
> ivec.push_back(42); // ✅ 正确
> ```

---

## 3.4 迭代器介绍 (Iterators)

迭代器是连接容器和算法的桥梁。虽然 vector 支持下标，但并非所有容器（如 list, map）都支持下标，但它们都支持迭代器。

### 1. 获取迭代器

- `v.begin()`: 指向第一个元素。
- `v.end()`: 指向**尾元素的下一位置 (One past the last element)**。如果容器为空，begin 等于 end。
    

### 2. 迭代器操作

- `*it`: 解引用，获取元素。
- `++it`, `--it`: 移动位置。
- `it->mem`: 等价于 `(*it).mem`，访问成员。
- `it1 == it2`: 判断是否指向同一位置。

### 3. 类型

- `vector<int>::iterator`: 可读写。
- `vector<int>::const_iterator`: 只读，不能修改指向的元素。
- `cbegin()`, `cend()` (C++11): 专门返回 const_iterator。

### 4. 迭代器运算 (仅 string 和 vector 支持)

- `it + n` / `it - n`: 跳跃移动。
- `it1 - it2`: 返回两个迭代器的距离（类型为 `difference_type`，带符号）。

> [!CAUTION] 迭代器失效
> 
> 凡是使用了迭代器的循环，都不要向容器添加元素（push_back）。因为添加元素可能导致 vector 扩容（重新分配内存），这会使所有指向旧内存的迭代器瞬间失效。

---

## 3.5 数组 (Arrays)

数组是 C++ 继承自 C 语言的低级数据结构。与 vector 不同，**数组的大小固定**。

### 1. 定义与初始化

- `int arr[10];` // 维度必须是常量表达式
- `int arr[] = {1, 2, 3};` // 自动推断维度为 3
- **限制**：数组**不能**直接拷贝或赋值！
    
    ```cpp
    int a[] = {1, 2};
    int b[] = a; // ❌ 错误
    ```
    

### 2. 复杂的数组声明

这也是面试常考点（由内向外读）：

- `int *ptrs[10];` -> `ptrs` 是一个数组，存了 10 个 `int*` (指针数组)。
- `int (*Parray)[10];` -> `Parray` 是一个指针，指向一个包含 10 个 int 的数组 (数组指针)。
    

### 3. 数组与指针的关系

在大多数表达式中，**数组名会自动退化（Decay）为指向首元素的指针**。


```cpp
int ia[] = {0, 1, 2};
auto ia2(ia); // ia2 是 int* 类型，指向 ia[0]
```

**例外**：使用 `decltype(ia)`, `sizeof(ia)`, `&ia` 时，数组不会退化。

### 4. 指针也是迭代器

C++11 引入了 `std::begin(arr)` 和 `std::end(arr)` 函数（定义在 `<iterator>` 头文件中），让数组可以用类似 vector 的方式遍历。

---

## 3.6 多维数组

C++ 并没有真正的“多维数组”，所谓的二维数组其实是 **“数组的数组”**。

### 1. 初始化

```cpp
int ia[3][4] = {
    {0, 1, 2, 3},
    {4, 5, 6, 7},
    {8, 9, 10, 11}
};
```

### 2. 使用范围 for 循环遍历

这是本节最大的考点。

```cpp
int ia[3][4];

// ✅ 正确写法
for (const auto &row : ia) {   // 外层必须引用！
    for (auto col : row) {
        cout << col << " ";
    }
}
```

> [!TIP] 为什么要用引用 (&row) ?
> 
> 如果外层不用引用 for (auto row : ia)，根据数组退化规则，row 会被推导为 指针 (int*)，指向每行的首元素。
> 
> 这样内层循环就变成了遍历一个指针，这在语法上是错误的（无法对 int* 进行 range-for）。
> 
> 所以，遍历多维数组时，外层循环控制变量必须声明为引用类型。

---

### 📚 总结

第 3 章是从 C 迈向 C++ 的分水岭。

1. 能用 `vector` 和 `string` 就不要用数组和 `char*`。
2. 理解**迭代器**是理解 STL 的钥匙。
3. 熟悉 `size_type` 和无符号数陷阱。
4. 掌握范围 `for` 循环和 `auto` 类型推导。