
# 📅 Day 7: 面向对象 (OOP) 与 栈队列 (Stack & Queue)

## 1. C++ 核心内功：类与内存管理

### 🧱 Struct vs Class

唯一的区别在于 **默认访问权限**：

- **Struct**: 默认为 `public` (兼容 C)。
    
- **Class**: 默认为 `private` (强调封装)。
    

### ⚡️ 构造函数：初始化列表 (Initializer List)


```cpp
// ✅ 推荐：初始化列表 (一步到位)
Student(string n) : name(n) {} 

// ❌ 不推荐：函数体内赋值 (先默认构造 -> 再赋值，效率低)
Student(string n) { name = n; }
```

> [!IMPORTANT] **强制使用场景**
> 
> 1. **const 成员** (生来就定型)。
>     
> 2. **引用成员 (&)** (必须依附于变量)。
>     
> 3. **无默认构造函数的类成员**。
>     

### 💀 深拷贝 vs 浅拷贝 (Deep vs Shallow Copy)

这是 C++ 面试的“死亡考点”。

- **浅拷贝 (Shallow)**：只复制指针地址。导致两个对象指向同一块堆内存 -> 析构时 **Double Free** 崩溃。
    
- **深拷贝 (Deep)**：`new` 一块新内存，把数据拷过来 (`strcpy`)。
    

#### 📝 标准赋值运算符写法 (背诵全文)


```cpp
// 必须返回引用 & 以支持连等 s1 = s2 = s3
MyString& operator=(const MyString& other) {
    // 1. 自我赋值检测 (Self-check)
    if (this == &other) return *this;

    // 2. 释放旧资源 (Release)
    delete[] data; 

    // 3. 分配新资源并复制 (Allocate & Copy)
    if (other.data) {
        data = new char[strlen(other.data) + 1];
        strcpy(data, other.data);
    } else {
        data = new char[1]; *data = '\0';
    }

    // 4. 返回自身 (Return)
    return *this;
}
```

---

## 2. 数据结构：栈与队列

### 📚 核心概念

|**结构**|**特性**|**形象比喻**|**典型操作**|
|---|---|---|---|
|**栈 (Stack)**|**LIFO** (后进先出)|弹夹、洗盘子|`push`, `pop`, `top`|
|**队列 (Queue)**|**FIFO** (先进先出)|食堂排队|`push`, `pop`, `front`, `back`|

### 🛠️ 手写栈 (Linked Stack)

今天用 **链表** 实现了栈：

- **入栈 (Push)** = 链表 **头插法** ($O(1)$)。
    
- **出栈 (Pop)** = 链表 **头删法** ($O(1)$)。
    
- **区别**：栈不需要 Dummy Head (虚拟头节点)，`topNode` 直接指向首元素。
    

---

## 3. ⚔️ 算法实战总结

### [232] 用栈实现队列 (Implement Queue using Stacks)

- **核心思想**：双栈法 (Input Stack + Output Stack)。
    
- **搬运策略 (Dump)**：
    
    - 只有当 `outStack` **为空**时，才把 `inStack` 的东西一次性全部“倒”进去。
        
    - 这实现了顺序的“负负得正” (逆序的逆序 = 正序)。
        

### [20] 有效的括号 (Valid Parentheses)

- **核心思想**：消消乐。左括号入栈，右括号找栈顶匹配。
    
- **优化技巧 (Fail Fast)**：
    
    1. 长度为奇数 -> 直接 False。
        
    2. 右括号来了但栈空 -> 直接 False。
        
    3. 右括号与栈顶不匹配 -> 直接 False。
        

### [155] 最小栈 (Min Stack) 🔥

- **难点**：`pop` 掉最小值后，如何找回“次小值”？
    
- **策略**：**1:1 同步辅助栈** (空间换时间)。
    
    - 主栈 `st` 进一个，辅助栈 `minSt` 必须进一个。
        
    - 如果新来的值 > 当前最小值，辅助栈 **重复压入** 当前最小值。
        
- **哲学**：保留“历史快照”。即使当前值很大，它存在期间的“统治者”依然是旧的最小值。
    


```cpp
// 核心逻辑：重复压入
if (minSt.empty() || val < minSt.top()) {
    minSt.push(val);
} else {
    minSt.push(minSt.top()); // 再次压入旧的最小值
}
```

---

## 4. 《C++ Primer》 拾遗 (Day 7 Reading)

- **`this` 指针**：指向当前对象的常量指针 (`Type *const`)。
    
- **`const` 成员函数**：`int get() const;` 本质是将 `this` 指针变成了“指向常量的指针”，因此函数内不能修改任何成员变量。
    
- **`explicit` 关键字**：
    
    - **作用**：防止单参数构造函数发生 **隐式类型转换**。
        
    - **例子**：避免 `func(10)` 意外地调用 `MyClass(int)` 创建临时对象。
        


### 第一部分：隐式的类类型转换 (Implicit Class Type Conversion)

#### 1. 什么是“隐式转换”？

在 C++ 中，如果你定义了一个**只接受一个实参**的构造函数，编译器就会偷偷赋予它一种超能力：**它允许你把这个实参的类型，直接当成类对象来用。**

简单说：编译器会自动帮你“脑补”一次构造函数的调用，把那个参数变成一个临时的对象。

#### 2. 举个栗子 (没加 `explicit` 之前)

假设你有一个 `SalesData` (销售数据) 类，它的构造函数只接受一个 `string` (书号)。


```cpp
class SalesData {
public:
    string bookNo;
    int units_sold = 0;

    // 单参数构造函数 (没有加 explicit)
    SalesData(string s) : bookNo(s) {} 
    
    // 一个普通函数，用来合并两个销售记录
    void combine(const SalesData& other) {
        // ... 合并逻辑
    }
};
```

**神奇的事情发生了：**


```cpp
int main() {
    SalesData myBook("978-001");
    string nextBookNo = "978-002";

    // 🚨 注意这行代码！
    // combine 函数明明要求传一个 SalesData 对象，但我却传了一个 string！
    myBook.combine(nextBookNo); 
}
```

编译器在背后干了什么？

它看到 combine 需要 SalesData，但你给了 string。它去查 SalesData 的构造函数，发现：“嘿！有个构造函数恰好只吃一个 string！”

于是它自动把代码变成了这样：


```cpp
// 编译器自动生成的临时对象
myBook.combine(SalesData(nextBookNo)); 
```

#### 3. 这有什么坏处？(为什么要禁止它)

乍一看好像很方便，但在很多场景下，这种“自作主张”的转换是**危险且不合逻辑**的。

场景 A：整数造成的误解

假设你还有一个构造函数 SalesData(int units) (用销量初始化)。


```cpp
void printBook(const SalesData& item);

// 你本来想打印这本书卖了 10 本
printBook(10); 
```

- **后果**：编译器会把 `10` 隐式转换成一个 `SalesData` 对象。这个对象的 `bookNo` 是空的，销量是 10。
    
- **问题**：读代码的人会一脸懵逼：“打印 10 是什么意思？” 这严重破坏了代码的可读性。
    

场景 B：性能损耗

编译器为了凑合你的参数，创建了一个临时的对象，用完马上就销毁了。如果这个转换发生得非常频繁，会带来不必要的开销。

#### 4. 解决方案：`explicit` 关键字

加上 `explicit` 的核心目的就是：**拒绝编译器的“自作聪明”，把控制权拿回到程序员手里。**
**`explicit`** (显式的) 就是用来封印这个“超能力”的符咒。
只要在构造函数前面加上 `explicit`，编译器就**必须**见到真正的构造代码，绝不瞎猜。


```cpp
class SalesData {
public:
    // ✅ 加上 explicit
    explicit SalesData(string s) : bookNo(s) {} 
    // ...
};

int main() {
    SalesData myBook("978-001");
    string nextBookNo = "978-002";

    // ❌ 报错！不能把 string 隐式转成 SalesData
    myBook.combine(nextBookNo); 

    // ✅ 正确：你必须显式地写出来
    myBook.combine(SalesData(nextBookNo)); 
    // 或者
    myBook.combine(static_cast<SalesData>(nextBookNo));
}
```



### 1. 什么是“错误的参数调用”？

这里的“错误”，通常不是指程序会崩溃（Syntax Error），而是指**逻辑歧义（Logic Ambiguity）**。

**最经典的“灾难”案例：`Array` 类**

想象你写了一个数组类，构造函数接受一个整数作为数组的大小：


```cpp
class MyArray {
public:
    // 没加 explicit
    MyArray(int size) { 
        // 申请 size 这么大的内存
    }
};

void printArray(const MyArray& arr) {
    // 打印数组内容
}
```

**如果没有 `explicit`，会发生什么？**

```cpp
int main() {
    // 你的本意：我想打印数字 5 吗？不对。
    // 你的本意：我想打印一个包含元素 5 的数组吗？也不对。
    
    printArray(5); 
}
```

- **编译器的逻辑**：“哦，`printArray` 需要 `MyArray`，你给了个 `int(5)`。我看 `MyArray` 有个构造函数能吃 `int`，那我帮你把 `5` 变成 `MyArray(5)`（即创建一个**大小为 5** 的空数组）传进去吧！”
    
- **后果**：
    
    1. **逻辑诡异**：代码写着 `printArray(5)`，结果运行起来打印了 5 个空东西。读代码的人会疯掉：“为什么打印 5 会出来一堆空值？”
        
    2. **性能浪费**：为了这一行代码，编译器偷偷申请了内存，创建了对象，用完马上析构释放。
        

---

### 2. 加上 `explicit` 后的世界


```cpp
class MyArray {
public:
    // ✅ 加上 explicit：必须显式调用！
    explicit MyArray(int size) { ... }
};
```

**现在再写 `printArray(5)`：**

- **编译器**：“报错！❌ `int` 不能隐式变成 `MyArray`。别想偷懒！”
    

**你必须这样写：**

```cpp
printArray(MyArray(5)); // ✅ 程序员必须明明白白写出来：我要创建一个大小为5的数组
```

这样，任何读代码的人（包括未来的你）看到 `MyArray(5)`，都能瞬间明白：“哦，这是在创建一个临时的大数组”，而不会误以为是在传数字 5。

### ⚡️ 总结：什么时候必须加 `explicit`？

请记住这个**“防坑指南”**：

只要你的构造函数 **只有 1 个参数**（或者虽然有多个参数，但除了第一个以外都有默认值），并且这个参数的类型和类本身**不是同一种概念**（例如 `int` vs `Array`，`string` vs `Book`），就**一定要加 `explicit`**。

**口诀：**

> **单参数构造函数，除非你极其确定需要隐式转换（极少见），否则一律加上 `explicit`，把解释权抓在程序员自己手里。**

---

### 第二部分：委托构造函数 (Delegating Constructor)

这是 C++11 引入的一个**大救星**功能，专门用来解决“代码重复”的问题。

#### 1. 痛点：以前的代码怎么写？

假设你的类有三个构造函数，它们的初始化逻辑很相似，都要做一些通用的设置（比如初始化随机数种子、打开日志等）。

**没有委托构造函数时 (C++98)：**


```cpp
class Role {
    int hp;
    int mp;
    string name;

    void init() { // 被迫写一个私有的 init 函数
        hp = 100;
        mp = 50;
        // ... 其他一大堆通用初始化逻辑
    }

public:
    Role() { 
        init(); // 调用通用逻辑
        name = "Default"; 
    }
    
    Role(string n) { 
        init(); // 重复调用
        name = n; 
    }
    
    Role(int h, int m) {
        init(); // 再次重复调用
        hp = h; // 这里还得覆盖掉 init 里的值，效率很低！
        mp = m;
    }
};
```

**缺点**：啰嗦，而且容易在赋值上做重复功。

#### 2. 现在的写法：把活儿“外包”出去

**委托构造函数**允许一个构造函数调用**同一个类**中的另一个构造函数。

- **委托者**：想偷懒的构造函数。
    
- **受委托者**：干脏活累活的核心构造函数。
    

**改造后 (C++11)：**


```cpp
class Role {
    int hp;
    int mp;
    string name;

public:
    // 1. 【受委托者】核心构造函数：干得最全
    Role(string n, int h, int m) : name(n), hp(h), mp(m) {
        // 这里可以写一些真正通用的逻辑，比如打印日志
        cout << "Role Created!" << endl;
    }

    // 2. 【委托者 A】默认构造
    // 语法：在冒号后面直接调用上面的构造函数
    Role() : Role("Default", 100, 50) { } 

    // 3. 【委托者 B】只带名字的构造
    Role(string n) : Role(n, 100, 50) { }
};
```

#### 3. 执行顺序

当你调用 `Role("Hero")` 时：

1. 先执行 **委托者 B** 的初始化列表 -> 找到 **受委托者 (核心构造)**。
    
2. 执行 **受委托者** 的函数体（打印 "Role Created!"）。
    
3. 回到 **委托者 B** 的函数体（如果有代码的话，继续执行）。
    

**形象比喻**：

- **受委托者**是“大厨”，负责做最核心的菜。
    
- **委托者**是“服务员”，接到客人的简单需求（比如只要默认套餐），转头告诉大厨做全套，自己不用亲自下厨。
    

### 📝 快速总结

1. **隐式转换**：
    
    - **现象**：单参数构造函数会让编译器把参数自动变成对象。
        
    - **风险**：代码可读性差，容易产生歧义。
        
    - **对策**：加 **`explicit`** 关键字禁用它。
        
2. **委托构造函数**：
    
    - **现象**：构造函数 A 调用构造函数 B。
        
    - **好处**：减少重复代码，逻辑复用。
        
    - **写法**：`Role() : Role("name", 100) {}` (写在初始化列表中)。
        



> Date: 2026-01-15
> 
> Tags: #Cpp #OOP #Stack #Queue #DeepCopy
> 