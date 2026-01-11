
## 💡 核心思想
**const** 是 C++ 中威力最强大的工具之一。它允许你指定一个语义约束（即“改对象不该被改动”），而编译器会强制实施这项约束。它不仅能防止意外修改，还能帮助编译器进行优化。

## 🔑 关键点详解

### 1. 指针与 const (Pointers)
这是最基础也最容易混淆的部分。规则看 **`*` 号的位置**：
* **const 在 `*` 左边**：被指物是常量 (Data is const)。
* **const 在 `*` 右边**：指针本身是常量 (Pointer is const)。
* **两边都有**：数据和指针都是常量。

```cpp
char greeting[] = "Hello";
char* p = greeting;             // non-const pointer, non-const data
const char* p = greeting;       // non-const pointer, const data
char* const p = greeting;       // const pointer, non-const data
const char* const p = greeting; // const pointer, const data
````

> **STL 迭代器补充**：
> - `std::vector<int>::iterator` 相当于 `T*`。
> - `std::vector<int>::const_iterator` 相当于 `const T*` (推荐使用)。

### 2. 函数声明中的 const

在一个函数声明式内，const 可以和函数返回值、各参数、函数自身（如果是成员函数）产生关联。
- **const 参数**：防止函数内部意外修改参数（尽量传 `const reference`）。
- **const 返回值**：防止用户对返回值进行荒谬的操作。
    - 例如：`const Rational operator*(...)` 可以防止 `(a * b) = c` 这种错误赋值。
### 3. const 成员函数 (Member Functions)
这是 const 最具威力的应用场景。
- **目的**：确认该成员函数可作用于 const 对象。
- **重载**：两个成员函数如果只是常量性 (constness) 不同，可以被重载。

```cpp
class TextBlock {
public:
    // const 版本：用于 const 对象
    const char& operator[](std::size_t position) const { return text[position]; }
    
    // non-const 版本：用于 non-const 对象
    char& operator[](std::size_t position) { return text[position]; }
private:
    std::string text;
};
```

### 4. 逻辑常量性 (Logical Constness) vs 二进制常量性 (Bitwise Constness)

- **二进制常量性**：C++ 编译器的默认定义。只要不修改对象内的任何成员变量（bit），就是 const。
- **逻辑常量性**：一个 const 成员函数可以修改它所处理的对象内的某些 bits，但只有在客户端侦测不出的情况下才得如此。

**问题**：如果我想在 const 函数里修改一个缓存变量（如 `lengthIsValid`），编译器会报错。 **解法**：使用 **`mutable`** 关键字。

```cpp
class CTextBlock {
private:
    char* pText;
    mutable std::size_t textLength; // 即使在 const 函数中也可以被修改
    mutable bool lengthIsValid;     
public:
    std::size_t length() const {
        if (!lengthIsValid) {
            textLength = std::strlen(pText); // 合法，因为是 mutable
            lengthIsValid = true;
        }
        return textLength;
    }
};
```

### 5. 在 const 和 non-const 成员函数中避免重复

当 const 和 non-const 版本的实现完全一样时，为了避免代码重复，可以**让 non-const 版本调用 const 版本**（反之则不行）。
这需要两次转型：
1. `static_cast`：把 `*this` 转为 `const`。
2. `const_cast`：把返回值的 `const` 移除。


```cpp
class TextBlock {
public:
    const char& operator[](std::size_t position) const {
        // ... 边界检查 ...
        // ... 志记访问 ...
        return text[position];
    }

    char& operator[](std::size_t position) {
        return const_cast<char&>(                 // 2. 移除 const
            static_cast<const TextBlock&>(*this)  // 1. 为 *this 加上 const
                [position]                        // 调用 const 版本
        );
    }
};
```

---

## 🚀 总结 (Takeaway)

1. **将某些东西声明为 const 可帮助编译器侦测出错误用法。** const 可被施加于任何作用域内的对象、函数参数、函数返回类型、成员函数本体。
2. **编译器强制实施 bitwise constness，但你编写程序时应该使用“概念上的常量性” (logical constness)。** (善用 `mutable`)
3. **当 const 和 non-const 成员函数有着实质等价的实现时，令 non-const 版本调用 const 版本可避免代码重复。**