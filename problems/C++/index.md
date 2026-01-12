---
layout: doc
title: C++ 面试八股文
editLink: true
---

# 🚀 C++ 面试八股文

这里汇总了 C++ 后端开发、游戏开发等岗位常见的高频面试题。

## 📚 目录导航

### 核心基础
- [**STL 与 语言基础**](STL与基础.md)
  - Vector 扩容机制与迭代器失效
  - String SSO (Small String Optimization)
  - 指针 vs 引用 (底层汇编视角)
  - Const 顶层与底层区别

### 🚧 施工中 (Coming Soon)
- **内存管理** (智能指针, RAII, 内存布局)
- **面向对象** (虚函数表, 菱形继承, 构造析构)
- **并发编程** (Mutex, Atomic, Memory Order)
- **C++11/14/17/20 新特性** (右值引用, Lambda, Coroutines)

---

## 💡 学习建议
C++ 的八股文不同于 Java，它更侧重于**底层原理**和**内存模型**。在背诵这些问题时，建议结合 [Compiler Explorer](https://godbolt.org/) 查看汇编代码，真正理解机器层面的行为。