const Freemarker = require('freemarker')
const path = require('path')

// author: 'huangtao'
// controllerpkg: 'controller'
// entityName: 'LearningLesson'
// genLombok: 'on'
// genMapper: 'on'
// genRestController: 'on'
// genService: 'on'
// genServiceImpl: 'on'
// genSwagger: 'on'
// mapperpkg: 'mapper'
// module: 'tj-learning'
// package: 'com.tianji.example'
// pktype: '1'
// serviceImplpkg: 'service.impl'
// servicepkg: 'service'
function getRenderData(options, entityName) {
    var data = {}
    var pkg = {}
    var table = {}

    pkg.Controller = options.package + '.' + options.controllerpkg
    pkg.Service = options.package + '.' + options.servicepkg
    pkg.ServiceImpl = options.package + '.' + options.serviceImplpkg
    pkg.Mapper = options.package + '.' + options.mapperpkg
    pkg.Entity = options.package + '.' + options.entitypkg
    pkg.ModuleName = entityName

    table.mapperName = entityName + 'Mapper'
    table.serviceName = 'I' + entityName + 'Service'
    table.controllerName = entityName + 'Controller'
    table.serviceImplName = entityName + 'ServiceImpl'
    table.entityName = entityName
    table.comment = entityName
    table.entity = entityName

    data.swagger = 'genSwagger' in options
    data.restControllerStyle = 'genRestController' in options
    data.superMapperClassPackage = 'com.baomidou.mybatisplus.core.mapper.BaseMapper'
    data.superServiceClassPackage = 'com.baomidou.mybatisplus.extension.service.IService'
    data.superServiceImplClassPackage = 'com.baomidou.mybatisplus.extension.service.impl.ServiceImpl'
    data.author = options.author
    data.superServiceClass = 'IService'
    data.superServiceImplClass = 'ServiceImpl'
    data.superMapperClass = 'BaseMapper'
    data.camelTableName = entityName.charAt(0).toLowerCase() + entityName.slice(1)
    data.package = pkg
    data.table = table
    data.entity = entityName

    return data
}

module.exports = {
    getRenderData,
}