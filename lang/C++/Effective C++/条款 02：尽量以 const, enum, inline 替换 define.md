核心思想可以概括为一句话：**尽量用编译器（Compiler）代替预处理器（Preprocessor）。**

以下是该条款的详细总结，分为三个主要场景：

### 1. 替换“常量宏” (Replacing Constant Macros)
**❌ 传统的做法：**
```
#define ASPECT_RATIO 1.653
```
**问题：**
- **调试困难**：`ASPECT_RATIO` 是由预处理器处理的，也就是在编译器开始工作之前，它已经被替换成了 `1.653`。因此，`ASPECT_RATIO` 这个名字**根本不会进入符号表（Symbol Table）**。如果你调试时看到一个错误涉及 `1.653`，你可能想不起来这代表什么。
- **作用域失控**：`#define` 没有作用域（Scope）的概念。一旦定义，除非 `#undef`，否则在后续所有代码中都有效，这破坏了类的封装性（无法创建 class 专属的 private 常量）。
✅ 推荐的做法：
使用 const 定义常量。
```cpp
const double AspectRatio = 1.653;
```
**优点：**
- **进入符号表**：调试器可以看到变量名。
- **有类型检查**：编译器会进行类型安全检查。
- **有作用域**：可以被封装在类或命名空间中。

**⚠️ 两个特殊情况：**
1. **常量指针**：如果你要在头文件中定义字符串常量，必须写两次 `const`（指针是常量，指向的数据也是常量）。
    ```cpp
    const char* const authorName = "Scott Meyers";
    // 或者更好的 C++ 写法：
    const std::string authorName("Scott Meyers");
    ```
2. **Class 专属常量**：必须声明为 `static` 成员。
    ```cpp
    class GamePlayer {
    private:
        static const int NumTurns = 5; // 声明（Declaration）
        int scores[NumTurns];          // 使用常量
    };
    ```
    _(注：旧式编译器可能要求在 .cpp 文件中提供定义式 `const int GamePlayer::NumTurns;`，但现代 C++ 通常允许在声明时直接初始化整型常量)_。

### 2. “Enum Hack” (枚举骗术)

如果你在使用比较老的编译器，不允许在类内部直接初始化 `static const int`，或者你想**绝对禁止**别人获取这个常量的地址（就像 `#define` 一样无法取地址），可以使用 `enum`。
**做法：**
```cpp
class GamePlayer {
private:
    enum { NumTurns = 5 }; // "Enum Hack"
    int scores[NumTurns];
};
```

**特点：**
- **行为像 `#define`**：取一个 `enum` 的地址是非法的（取 `const` 的地址是合法的）。
- **遵守作用域**：它被限制在类内部，不会污染全局命名空间。
- 这在模板元编程中非常常见。

### 3. 替换“宏函数” (Replacing Function-like Macros)
❌ 传统的做法：
为了避免函数调用的开销，C 程序员喜欢用宏来实现简单的函数。
```
// 这里的括号是必须的，否则会有运算优先级问题
#define CALL_WITH_MAX(a, b) ((a) > (b) ? (a) : (b))
```

问题（非常严重）：
宏不仅难以编写（所有参数都要加括号），而且有可怕的副作用。
```cpp
int a = 5, b = 0;
CALL_WITH_MAX(++a, b); 
// 宏展开后变成： ((++a) > (b) ? (++a) : (b))
// a 被累加了两次！结果变成 7，而不是预期的 6。
```
✅ 推荐的做法：
使用 inline 的模板函数。

```cpp
template<typename T>
inline void callWithMax(const T& a, const T& b) {
    f(a > b ? a : b);
}
```

**优点：**
- **效率**：和宏一样，没有函数调用的额外开销（内联）。
- **安全**：遵守所有类型安全和作用域规则。
- **正确性**：参数只会计算一次，避免了 `++a` 被执行两次的副作用。
### 总结
请记住该条款的结论：
1. 对于**单纯的常量**，最好以 `const` 对象或 `enum` 替换 `#define`。
2. 对于**形似函数的宏** (macros)，最好改用 `inline` 函数替换 `#define`。