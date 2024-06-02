# mybatis-code-generator

MyBatis Plus代码生成器，IDEA 插件移植

## Features

可以生成 REST 风格控制器，service，serviceImpl 代码，mapper 代码，实体类代码。

## Requirements

本插件使用了 freemarker，
需要有 Java 环境并正确设置 JAVA_HOME 环境变量。

## Usage

打开 vscode 的命令面板：有两个命令分别为

* `MP Code Generator: Configure Database` 配置数据库，配置完成后会在 .vscode 文件夹下生成 generator.yaml文件

![无法加载图片](https://huangtao666.oss-cn-hangzhou.aliyuncs.com/configure.gif)
* `MP Code Generator: SetUp Template` 配置生成代码选项

![无法加载图片](https://huangtao666.oss-cn-hangzhou.aliyuncs.com/gencode.gif)

**Enjoy!**
