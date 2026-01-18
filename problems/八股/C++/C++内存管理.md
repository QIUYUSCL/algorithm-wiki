# C++内存管理

## 什么是智能指针，C++中有哪几种智能指针?

### 简要回答

智能指针 是一种**自动管理动态内存**的工具类，用于**防止内存泄漏**。

c++提供了三种常用的指针 **unique，share，weak**。

unique**独占所有权**，指针指向的对象**只能有这一个**指针。

shared**共享所有权**，指针**可以有多个**，每释放一个指针变量，指针计数减少一个，到零时释放被指对象，常用来计数。

weak指针是一种**弱指针**，**不拥有资源，防止循环引用**，如果对象在指针还在时被释放，也不会报错，不受影响。

### 详细回答

提到智能指针就必须知道RAII的编程思想，RAII是C++语言的一种**管理资源、避免泄漏**的惯用法。

智能指针是用来自动管理动态内存的工具，通过封装原生指针在适当时机释放内存。

unique_ptr：独占智能指针，独占对象所有权，同一时间只能有一个指针指向一个对象，适合独占资源的场景；**禁止拷贝构造和拷贝赋值，支持移动语义**。

share_ptr：一个**共享所有权**的智能指针，**允许对象之间进行复制或者赋值**，展示出来的就是**值语义**。

使用引用**计数的观点**，当对象之间进行复制或者赋值的时候，引用计数会加+1，当最后一个对象销毁的时候，引用计数减为0，此时会回收托管的空间。

weak_ptr：常用于解决share_ptr**循环引用**的问题，weak_ptr类的对象可以指向shared_ptr，并且不会改变shared_ptr的引用计数。一旦最后一个shared_ptr被销毁时，对象就会被释放。

智能指针则深刻的体现了这种思想。在现代 C++ 编程中，标准库包含智能指针，该指针用于**确保**程序**不存在内存和资源泄漏且是异常安全的**。

智能指针本质就是一个类模板，它可以创建任意的类型的指针对象，当智能指针对象使用完后，对象就会自动调用析构函数去释放该指针所指向的空间。

### 代码示例

1. 独占指针 std::unique_ptr 独占指针,不能拷贝，只能移动，一个资源只能被一个unique管理

```cpp
#include <memory>
std::unique_ptr<int> ptr1(new int(10));
// std::unique_ptr<int> ptr2 = ptr1.  错误，不可拷贝
std::unique_ptr<int> ptr2 = std::move(ptr1); //正确
```

2. 共享指针 std::shared_ptr 共享指针，多个指针可以共享一个资源，使用**计数器**控制资源释放

```cpp
#include <memory>
std::shared_ptr<int> p1 = std::make_shared<int>(10);
std::shared_ptr<int> p2 = p1;  // 引用计数 +1
```

3. 弱指针 用于观察共享指针的管理资源，不增加引用计数，防止循环引用

```cpp
std::shared_ptr<int> sp = std::make_shared<int>(42);
std::weak_ptr<int> wp = sp;  // 不增加引用计数
```

4. 三个指针同时运用的例子

```cpp
#include <iostream>
#include <memory>
using namespace std;

class Animal {
public:
    Animal(string name) : name_(name) {
        cout << "Animal " << name_ << " created.\n";
    }
    ~Animal() {
        cout << "Animal " << name_ << " destroyed.\n";
    }
    void speak() {
        cout << "Hi, I'm " << name_ << endl;
    }

private:
    string name_;
};

int main() {
    // 1. 使用 unique_ptr 管理一只独占的小狗
    unique_ptr<Animal> dog = make_unique<Animal>("Dog");
    dog->speak();

    // 2. 使用 shared_ptr 管理一只共享的猫
    shared_ptr<Animal> cat1 = make_shared<Animal>("Cat");
    {
        shared_ptr<Animal> cat2 = cat1;  // 共享一份资源
        cout << "Cat use_count = " << cat1.use_count() << endl; // 应该是 2
    } // cat2 离开作用域，引用计数 -1
    cout << "Cat use_count = " << cat1.use_count() << endl; // 应该是 1

    // 3. 使用 weak_ptr 观察 shared_ptr 管理的猫
    weak_ptr<Animal> weakCat = cat1;
    if (auto catShared = weakCat.lock()) {
        catShared->speak();  // 还活着，可以访问
    }

    // cat1 离开作用域后，猫对象自动销毁
    return 0;
}
//==================================//
// 输出结果
Animal Dog created.
Hi, I'm Dog
Animal Cat created.
Cat use_count = 2
Cat use_count = 1
Hi, I'm Cat
Animal Dog destroyed.
Animal Cat destroyed.
```

### 知识拓展

- 智能指针图解
    
    ![image](https://file1.kamacoder.com/i/bagu/202507061.png)
    
    - 什么是RAII机制？ RAII 全称： Resource Acquisition Is Initialization（资源获取即初始化）
    
    即：当你用一个智能指针去**创建**对象时，它立刻就会接管资源（如内存）； 当智能指针生命周期结束（如**离开作用域、函数返回**等），它会**自动调用析构函数**，把**资源安全释放掉**，**不需要你手动 delete**。
    
    通俗的讲就是，RAII就是“我拿到资源我就负责到底，我走了我就顺手把它销毁”
    
```cpp
  {
    std::unique_ptr<int> ptr(new int(10)); // 构造：自动接管资源
    // ...用 ptr 做点什么
	} // 离开作用域，析构：自动释放内存
```
    
 - 记忆口诀
    
    unique 独家专属，不能复制
    
    shared 合作共赢，数清关系
    
    weak 偷偷观察，不管后事
    
    RAII 是关键，内存不手动
    

### 堆和栈的区别

栈和堆都是用于存储程序数据的内存区域。栈是一种有限的内存区域，用于存储局部变量、函数调用信息等。堆是一种动态分配的内存区域，用于存储程序运行时动态分配的数据。

栈上的变量生命周期与其所在函数的执行周期相同，而堆上的变量生命周期由程序员显式控制，可以（使用 `new` 或 `malloc`）和释放（使用 `delete` 或 `free`）。

栈上的内存分配和释放是自动的，速度较快。而堆上的内存分配和释放需要手动操作，速度相对较慢。

## C++内存分区

C++程序运行时，内存被分为几个不同的区域，每个区域负责不同的任务。

![image-20240110142421854](https://file1.kamacoder.com/i/bagu/image-20240110142421854.png)

1. 栈

栈用于存储函数的局部变量、函数参数和函数调用信息的区域。函数的调用和返回通过栈来管理。

2. 堆

堆用于存储动态分配的内存的区域，由程序员手动分配和释放。使用 `new` 和 `delete` 或 `malloc` 和 `free` 来进行堆内存的分配和释放。

3. 全局/静态区

全局区存储全局变量和静态变量。生命周期是整个程序运行期间。在程序启动时分配，程序结束时释放。

4. 常量区

常量区也被称为只读区。存储常量数据，如字符串常量。

5. 代码区

存储程序的代码。

## 内存泄漏？如何避免？

**1、什么是内存泄露?**

内存泄漏(memory leak)是指由于疏忽或错误造成了**程序未能释放掉不再使用的内存的情况**。内存泄漏并非指内存在物理上的消失，而是应用程序分配某段内存后，由于设计错误，失去了对该段内存的控制，因而造成了内存的浪费。

可以使用Valgrind, mtrace进行内存泄漏检查。

**2、内存泄漏的分类**

（1）堆内存泄漏 （Heap leak）

对内存指的是程序运行中根据需要分配通过malloc,realloc new等从堆中分配的一块内存，再是完成后必须通过调用对应的 free或者 delete 删掉。如果程序的设计的错误导致这部分内存没有被释放，那么此后这块内存将不会被使用，就会产生 Heap Leak.

（2）系统资源泄露（Resource Leak）

主要指程序使用系统分配的资源比如 Bitmap,handle ,SOCKET 等没有使用相应的函数释放掉，导致系统资源的浪费，严重可导致系统效能降低，系统运行不稳定。

（3）没有将基类的析构函数定义为虚函数

当基类指针指向子类对象时，如果基类的析构函数不是 virtual，那么子类的析构函数将不会被调用，子类的资源没有正确是释放，因此造成内存泄露。

**3、什么操作会导致内存泄露?**

指针指向改变，未释放动态分配内存。

**4、如何防止内存泄露?**

将内存的分配封装在类中，构造函数分配内存，析构函数释放内存；使用智能指针

**5、智能指针有了解哪些?**

智能指针是为了解决动态分配内存导致内存泄露和多次释放同一内存所提出的，C11标准中放在< memory>头文件。包括:共享指针，独占指针，弱指针

**6、构造函数，析构函数要设为虚函数吗，为什么？**

（1）析构函数

析构函数需要。当派生类对象中有内存需要回收时，如果析构函数不是虚函数，不会触发动态绑定，只会调用基类析构函数，导致派生类资源无法释放，造成内存泄漏。

（2）构造函数

构造函数不需要，没有意义。虚函数调用是在部分信息下完成工作的机制，允许我们只知道接口而不知道对象的确切类型。 要创建一个对象，你需要知道对象的完整信息。 特别是，你需要知道你想要创建的确切类型。 因此，构造函数不应该被定义为虚函数。

## new 和 malloc 有什么区别？

**类型安全性：**

- `new` 是C++的运算符，可以为对象分配内存并调用相应的构造函数。
- `malloc` 是C语言库函数，只分配指定大小的内存块，不会调用构造函数。

**返回类型：**

- `new` 返回的是具体类型的指针，而且不需要进行类型转换。
- `malloc` 返回的是`void*`，需要进行类型转换，因为它不知道所分配内存的用途。

**内存分配失败时的行为：**

- `new` 在内存分配失败时会抛出 `std::bad_alloc` 异常。
- `malloc` 在内存分配失败时返回 `NULL`。

**内存块大小：**

- `new` 可以用于动态分配数组，并知道数组大小。
- `malloc` 只是分配指定大小的内存块，不了解所分配内存块的具体用途。

**释放内存的方式：**

- `delete` 会调用对象的析构函数，然后释放内存。
- `free` 只是简单地释放内存块，不会调用对象的析构函数。

## delete 和 free 有什么区别？

**类型安全性：**

- `delete` 会调用对象的析构函数，确保资源被正确释放。
- `free` 不了解对象的构造和析构，只是简单地释放内存块。

**数组的释放：**

- `delete` 可以正确释放通过 `new[]` 分配的数组。
- `free` 不了解数组的大小，不适用于释放通过 `malloc` 分配的数组。

## 讲一讲 野指针 与 悬空指针

野指针（Wild Pointer）

- 定义：指针指向了不可预测的内存区域，常见原因：
- 1.未初始化
- 2.越界访问
- 3.指针被非法修改

特征：指针值是随机垃圾值（大概率非法地址），从未或不再指向有效内存

示例：

```cpp
int *p;      // 未初始化
*p = 10;     // 野指针访问
```

> 依据：《C Primer Plus》第 11 章指针部分，提到“未初始化的指针将指向随机内存区域，极其危险”

悬空指针（Dangling Pointer）

- 定义：指针原本指向一块有效内存，但这块内存已被释放或生命周期结束，指针仍然保存着原地址。

特征：指针值是原地址，看似“正常”，曾经有效，但现在失效

示例：

```cpp
int *p = malloc(sizeof(int));
free(p);   // 内存已释放
*p = 20;   // 悬空指针
```

> 依据《Effective C++》条款 5、6 里反复强调“释放资源后要将指针置为 nullptr，否则会产生 dangling pointer”

## 内存对齐是什么？为什么需要考虑内存对齐？

1. 什么是内存对齐

内存对齐是指数据在内存中的存储起始地址是某个值的倍数。

在C语言中，结构体是一种复合数据类型，其构成元素既可以是基本数据类型（如int、long、float等）的变量，也可以是一些复合数据类型（如数组、结构体、联合体等）的数据单元。在结构体中，**编译器为结构体的每个成员按其自然边界（alignment）分配空间。**各个成员按照它们被声明的顺序在内存中顺序存储，第一个成员的地址和整个结构体的地址相同。

为了使CPU能够对变量进行快速的访问，变量的起始地址应该具有某些特性，**即所谓的“对齐”，比如4字节的int型，其起始地址应该位于4字节的边界上，即起始地址能够被4整除**，也即“对齐”跟数据在内存中的位置有关。如果一个变量的内存地址正好位于它长度的整数倍，他就被称做自然对齐。

比如在32位cpu下，假设一个整型变量的地址为0x00000004(为4的倍数)，那它就是自然对齐的，而如果其地址为0x00000002（非4的倍数）则是非对齐的。现代计算机中内存空间都是按照byte划分的，从理论上讲似乎对任何类型的变量的访问可以从任何地址开始，但实际情况是在访问特定类型变量的时候经常在特定的内存地址访问，这就需要各种类型数据按照一定的规则在空间上排列，而不是顺序的一个接一个的排放，这就是对齐。

2. 为什么需要考虑内存对齐

需要字节对齐的根本原因在于**CPU访问数据的效率问题**。假设上面整型变量的地址不是自然对齐，比如为0x00000002，则CPU如果取它的值的话需要访问两次内存，第一次取从0x00000002-0x00000003的一个short，第二次取从0x00000004-0x00000005的一个short然后组合得到所要的数据，如果变量在0x00000003地址上的话则要访问三次内存，第一次为char，第二次为short，第三次为char，然后组合得到整型数据。

而如果变量在自然对齐位置上，则只要一次就可以取出数据。一些系统对对齐要求非常严格，比如sparc系统，如果取未对齐的数据会发生错误，而在x86上就不会出现错误，只是效率下降。

各个硬件平台对存储空间的处理上有很大的不同。一些平台对某些特定类型的数据只能从某些特定地址开始存取。比如有些平台每次读都是从偶地址开始，如果一个int型（假设为32位系统）如果存放在偶地址开始的地方，那么一个读周期就可以读出这32bit，而如果存放在奇地址开始的地方，就需要2个读周期，并对两次读出的结果的高低字节进行拼凑才能得到该32bit数据。显然在读取效率上下降很多。

- 大多数计算机硬件要求基本数据类型的变量在内存中的地址是它们大小的倍数。例如，一个 32 位整数通常需要在内存中对齐到 4 字节边界。
- 内存对齐可以提高访问内存的速度。当数据按照硬件要求的对齐方式存储时，CPU可以更高效地访问内存，减少因为不对齐而引起的性能损失。
- 许多计算机体系结构使用缓存行（cache line）来从内存中加载数据到缓存中。如果数据是对齐的，那么一个缓存行可以装载更多的数据，提高缓存的命中率。
- 有些计算机架构要求原子性操作（比如原子性读写）必须在特定的内存地址上执行。如果数据不对齐，可能导致无法执行原子性操作，进而引发竞态条件。

## 测试题目

**1、以下为WindowsNT 32位C++程序，请计算下面sizeof的值**

 ```cpp
  char str[] = "hello";
 char* p = str;
 int n = 10;
 // 请计算
 sizeof(str) = ?
 sizeof(p) = ?
 sizeof(n) = ?

 void Func(char str[100])
 {
    // 请计算
    sizeof(str) = ?
 }
 void* p = malloc(100);
 // 请计算
 sizeof(p) = ?
 ```

**参考答案：**

```cpp
sizeof(str) = 6;
```

sizeof()计算的是数组的所占内存的大小包括末尾的 '\0'

```cpp
sizeof(p) = 4;
```

p为指针变量，32位系统下大小为 4 bytes

```cpp
sizeof(n) = 4;
```

n 是整型变量，占用内存空间4个字节

```cpp
void Func(char str[100])
{
 sizeof(str) = 4;
}
```

函数的参数为字符数组名，即数组首元素的地址，大小为指针的大小

```cpp
void* p = malloc(100);
sizeof(p) = 4;
```

p指向malloc分配的大小为100 byte的内存的起始地址，sizeof(p)为指针的大小，而不是它指向内存的大小

**2、分析运行下面的Test函数会有什么样的结果**

```cpp
void GetMemory1(char* p)
{
    p = (char*)malloc(100);
}

void Test1(void)
{
    char* str = NULL;
    GetMemory1(str);
    strcpy(str, "hello world");
    printf(str);
}

char *GetMemory2(void)
{
    char p[] = "hello world";
    return p;
}

void Test2(void)
{
    char *str = NULL;
    str = GetMemory2();
    printf(str);
}

void GetMemory3(char** p, int num)
{
    *p = (char*)malloc(num);
}

void Test3(void)
{
    char* str = NULL;
    GetMemory3(&str, 100);
    strcpy(str, "hello");
    printf(str);
}
```

**参考答案：**

**Test1(void)**：

**程序崩溃。** 因为GetMemory1并不能传递动态内存，Test1函数中的 str一直都是NULL。strcpy(str, "hello world")将使程序奔溃

**Test2(void)**：

**可能是乱码。** 因为GetMemory2返回的是指向“栈内存”的指针，该指针的地址不是NULL，使其原现的内容已经被清除，新内容不可知。

**Test3(void)：**

能够输出hello, **内存泄露**。GetMemory3申请的内存没有释放

**3、实现内存拷贝函数**

```cpp
char* strcpy(char* strDest, const char* strSrc);
```

**参考答案：**(函数实现)

```cpp
char* strcpy(char *dst,const char *src) {// [1] 
    assert(dst != NULL && src != NULL);  // [2]
    char *ret = dst;                     // [3]
    while ((*dst++=*src++)!='\0');       // [4]
    return ret;
}
```
**[1] const修饰：**

（1）源字符串参数用const修饰，防止修改源字符串。

**[2] 空指针检查：**

（1）不检查指针的有效性，说明答题者不注重代码的健壮性。

（2）检查指针的有效性时使用 `assert(!dst && !src);`

char *转换为 bool 即是类型隐式转换，这种功能虽然灵活，但更多的是导致出错概率增大和维护成本升高。

（3）检查指针的有效性时使用 `assert(dst != 0 && src != 0);`

直接使用常量（如本例中的0）会减少程序的可维护性。而使用NULL代替0，如果出现拼写错误，编译器就会检查出来。

**[3] 返回目标地址：**

（1）忘记保存原始的strdst值。

**[4] '\0'：**

（1）循环写成 `while (*dst++=*src++);` 明显是错误的。

（2）循环写成 `while (*src!='\0') *dst++ = *src++;`

循环体结束后，dst字符串的末尾没有正确地加上'\0'。

（3）为什么要返回char *？

**返回dst的原始值使函数能够支持链式表达式**

链式表达式的形式如：

`int l=strlen(strcpy(strA,strB));`

又如：

`char * strA=strcpy(new char[10],strB);`

返回strSrc的原始值是错误的。

**理由：**

1. 源字符串肯定是已知的，返回它没有意义
2. 不能支持形如第二例的表达式
3. 把`const char *作为char *`返回，类型不符，编译报错

**4、假如考虑dst和src内存重叠的情况，strcpy该怎么实现**

```cpp
char s[10]="hello";

strcpy(s, s+1); 
// 应返回 ello

strcpy(s+1, s); 
// 应返回 hhello 但实际会报错
// 因为dst与src重叠了，把'\0'覆盖了
```

所谓重叠，就是src未处理的部分已经被dst给覆盖了，只有一种情况：`src<=dst<=src+strlen(src)`

C函数 memcpy 自带内存重叠检测功能，下面给出 memcpy 的实现my_memcpy

```cpp
char * strcpy(char *dst,const char *src)
{
    assert(dst != NULL && src != NULL);
    char *ret = dst;
    my_memcpy(dst, src, strlen(src)+1);
    return ret;
}

/* my_memcpy的实现如下 */
char *my_memcpy(char *dst, const char* src, int cnt)
{
    assert(dst != NULL && src != NULL);
    char *ret = dst;
    /*内存重叠，从高地址开始复制*/
    if (dst >= src && dst <= src+cnt-1)
    {
        dst = dst+cnt-1;
        src = src+cnt-1;
        while (cnt--) 
        { 
            *dst-- = *src--;
        }
    }
    else  //正常情况，从低地址开始复制
    {
        while (cnt--) 
        {
            *dst++ = *src++;
        }
    }
    return ret;
}
```

**5、按照下面描述的要求写程序**

已知String的原型为：

```cpp
class String 
{
public:
    String(const char *str = NULL);
    String(const String &other);
    ~ String(void);
    String & operate =(const String &other);
private:
  char *m_data;
}; 
``` 

请编写上述四个函数

**参考答案：**

此题考察对构造函数赋值运算符实现的理解。实际考察类内含有指针的构造函数赋值运算符函数写法。

```cpp
// 构造函数
String::String(const char *str) 
{ 
    if(str==NULL) 
    { 
        m_data = new char[1];  //对空字符串自动申请存放结束标志'\0' 
        *m_data = '\0'; 
    }   
    else 
    { 
        int length = strlen(str); 
        m_data = new char[length + 1];
        strcpy(m_data, str); 
    } 
} 

// 析构函数 
String::~String(void) 
{ 
    delete [] m_data; // 或delete m_data; 
} 

//拷贝构造函数 
String::String(const String &other)
{
    int length = strlen(other.m_data);
    m_data = new char[length + 1];
    strcpy(m_data, other.m_data);
}

//赋值函数 
String &String::operate =(const String &other)
{   
    if(this == &other) 
    {
        return *this; // 检查自赋值
    }  
    delete []m_data; // 释放原有的内存资源
    int length = strlen(other.m_data);
    m_data = new char[length + 1]; //对m_data加NULL判断
    strcpy(m_data, other.m_data);  
    return *this; //返回本对象的引用
} 
```

**6、说一说进程的地址空间分布**

**参考答案：**

对于一个进程，其空间分布如下图所示：

![](https://file1.kamacoder.com/i/bagu/_memory_xiaoyi.png)

如上图，从高地址到低地址，一个程序由命令行参数和环境变量、栈、文件映射区、堆、BSS段、数据段、代码段组成。

（1）命令行参数和环境变量

命令行参数是指从命令行执行程序的时候，给程序的参数。

（2）栈区

存储局部变量、函数参数值。栈从高地址向低地址增长。是一块连续的空间。

（3）文件映射区

位于堆和栈之间。

（4）堆区

动态申请内存用。堆从低地址向高地址增长。

（5）BSS 段

存放程序中未初始化的 全局变量和静态变量 的一块内存区域。

（6）数据段

存放程序中已初始化的 全局变量和静态变量 的一块内存区域。

（7）代码段

存放程序执行代码的一块内存区域。只读，代码段的头部还会包含一些只读的常数变量。

**7、说一说C与C++的内存分配方式**

（1）从静态存储区域分配

内存在**程序编译的时候就已经分配好**，这块内存在程序的整个运行期间都存在，如全局变量，static变量。

（2）在栈上创建

在执行函数时，函数内局部变量的存储单元都可以在栈上创建，函数执行结束时这些存储单元**自动被释放**。栈内存分配运算内置于处理器的指令集中，效率很高，但是分配的内存容量有限。

（3）从堆上分配(动态内存分配)

程序在运行的时候用malloc或new申请任意多少的内存，程序员负责在何时用free或delete释放内存。动态内存的**生存期自己决定**，使用非常灵活。

**8、new、delete、malloc、free关系**

**参考答案：**

如果是带有自定义析构函数的类类型，用 new [] 来创建类对象数组，而用 delete来释放会发生什么？用上面的例子来说明：

```cpp
class A {};
A* pAa = new A[3];
delete pAa;
```

那么 delete pAa; 做了两件事：

1. 调用一次 pAa 指向的对象的析构函数
2. 调用 operator delete(pAa);释放内存

显然，这里只对数组的第一个类对象调用了析构函数，后面的两个对象均没调用析构函数，如果类对象中申请了大量的内存需要在析构函数中释放，而你却在销毁数组对象时少调用了析构函数，这会造成内存泄漏。

上面的问题你如果说没关系的话，那么第二点就是致命的了！直接释放pAa指向的内存空间，这个总是会造成严重的 段错误，程序必然会奔溃！因为分配的空间的起始地址是 pAa 指向的地方减去 4 个字节的地方。你应该传入参数设为那个地址！

## 计算机中的乱序执行

**1、一定会按正常顺序执行的情况**

1. 对同一块内存进行访问，此时访问的顺序不会被编译器修改
    
2. 新定义的变量的值依赖于之前定义的变量，此时两个变量定义的顺序不会被编译器修改
    

**2、其他情况计算机会进行乱序执行**

单线程的情况下允许，但是多线程情况下就会产生问题

**3、C++中的库中提供了六种内存模型**

用于在多线程的情况下防止编译器的乱序执行

（1）memory_order_relaxed

最放松的

（2）memory_order_consume

当客户使用，搭配release使用，被release进行赋值的变量y，获取的时候如果写成consume，那么所有与y有关的变量的赋值一定会被按顺序进行

（3）memory_order_acquire

用于获取资源

（4）memory_order_release

一般用于生产者，当给一个变量y进行赋值的时候，只有自己将这个变量释放了，别人才可以去读，读的时候如果使用acquire来读，编译器会保证在y之前被赋值的变量的赋值都在y之前被执行，相当于设置了内存屏障

（5）memory_order_acq_rel（acquire/release）

（6）memory_order_seq_cst（squentially consistent）

好处：不需要编译器设置内存屏障，morden c++开始就会有底层汇编的能力

#### 副作用

**1、无副作用编程**

存在一个函数，传一个参数x进去，里面进行一系列的运算，返回一个y。中间的所有过程都是在栈中进行修改

**2、有副作用编程**

比如在一个函数运行的过程中对全局变量进行了修改或在屏幕上输出了一些东西。此函数还有可能是类的成员方法，在此方法中如果对成员变量进行了修改，类的状态就会发生改变

**3、在多线程情况下的有副作用编程**

在线程1运行的时候对成员变量进行了修改，此时如果再继续运行线程2，此时线程2拥有的就不是这个类的初始状态，运行出来的结果会收到线程1的影响

解决办法：将成员方法设为const，此时就可以放心进行调用

#### 信号量

**1、binary_semaphore**

**定义：**

可以当事件来用，只有有信号和无信号两种状态，一次只能被一个线程所持有。

**使用步骤**：

（1）初始创建信号量，并且一开始将其置位成无信号状态

std::binary_semaphore sem(0)

（2）线程使用acquire()方法等待被唤醒

（3）主线程中使用release()方法，将信号量变成有信号状态

**2、counting_semaphore**

**定义：**

一次可以被很多线程所持有，线程的数量由自己指定

**使用步骤：**

（1）创建信号量

指定一次可以进入的线程的最大数量，并在最开始将其置位成无信号状态：std::biinary_semaphore<8> sem(0);

（2）主线程中创建10个线程

并且这些线程全部调用acquire()方法等待被唤醒。但是主线程使用release(6)方法就只能随机启用6个线程。

#### future库

用于任务链（即任务A的执行必须依赖于任务B的返回值）

**1、例子：生产者消费者问题**

（1）子线程作为消费者

参数是一个future，用这个future等待一个int型的产品：std::future& fut

（2）子线程中使用get()方法等待一个未来的future，返回一个result

（3）主线程作为生产者,做出一个承诺：std::promise prom

（4）用此承诺中的get_future()方法获取一个future

（5）主线程中将子线程创建出来,并将刚刚获取到的future作为参数传入

（6）主线程做一些列的生产工作,最后生产完后使用承诺中的set_value()方法，参数为刚刚生产出的产品

（7）此时产品就会被传到子线程中,子线程就可以使用此产品做一系列动作

（8）最后使用join()方法等待子线程停止,但是join只适用于等待没有返回值的线程的情况

**2、如果线程有返回值**

（1）使用async方法可以进行异步执行

**参数一：** 可以选择是马上执行还是等一会执行（即当消费者线程调用get()方法时才开始执行）

**参数二：** 执行的内容（可以放一个函数对象或lambda表达式）

（2）生产者使用async方法做生产工作并返回一个future

（3）消费者使用future中的get（）方法可以获取产品

![](https://file1.kamacoder.com/i/bagu/_renwulian_33.png)

## 字符串操作函数

常见的字符串函数实现

**1、strcpy()**

把从strsrc地址开始且含有'\0'结束符的字符串复制到以strdest开始的地址空间，返回值的类型为char*

![](https://file1.kamacoder.com/i/bagu/_strcpy_Goaway.png)

**2、strlen()**

计算给定字符串的长度。

![](https://file1.kamacoder.com/i/bagu/_strlen_Goaway.png)

**3、strcat()**

作用是把src所指字符串添加到dest结尾处。

![](https://file1.kamacoder.com/i/bagu/_strcat_Goaway.png)

**4、strcmp()**

比较两个字符串设这两个字符串为str1，str2，

若str1 == str2，则返回零  
若str1 < str2，则返回负数  
若str1 > str2，则返回正数

![](https://file1.kamacoder.com/i/bagu/_strcmp_Goaway.png)