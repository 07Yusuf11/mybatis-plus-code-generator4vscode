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
function getRenderData(config, entityClassName, tableMetaInfo) {
    var data = {}
    var pkg = {}
    var table = {}

    pkg.Controller = config.package + '.' + config.controllerpkg
    pkg.Service = config.package + '.' + config.servicepkg
    pkg.Entity = config.package + '.' + entityClassName

    table.serviceName = entityClassName + 'Service'
    table.entityName = entityClassName
    table.controllerName = entityClassName + 'Controller'
    table.comment = tableMetaInfo.comment
    table.entityPath = tableMetaInfo.tableName

    data.swagger2 = config.genSwagger === 'on'
    data.restControllerStyle = config.genRestController === 'on'
    data.author = config.author
    data.entity = entityClassName

    data.package = pkg
    data.table = table

    return data
}

function renderController(module, data) {
    const controllerPath = path.join(module, ...data.package.Controller.split('.'))
    console.log(data)
    console.log(controllerPath)
}

module.exports = {
    getRenderData,
    renderController
}