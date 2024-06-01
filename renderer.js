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

    pkg.Controller = options.controllerpkg === '' ? undefined : options.package + '.' + options.controllerpkg
    pkg.Service = options.servicepkg === '' ? undefined : options.package + '.' + options.servicepkg 
    pkg.ServiceImpl = options.servicepkg === '' ? undefined : options.package + '.' + options.serviceImplpkg
    pkg.Mapper = options.mapperpkg === '' ? undefined : options.package + '.' + options.mapperpkg
    pkg.Entity = options.entitypkg === '' ? undefined : options.package + '.' + options.entitypkg
    pkg.ModuleName = entityName

    table.mapperName = entityName + 'Mapper'
    table.serviceName = 'I' + entityName + 'Service'
    table.controllerName = entityName + 'Controller'
    table.serviceImplName = entityName + 'ServiceImpl'
    table.entityName = entityName
    table.comment = entityName
    table.entity = entityName
    // table.name

    data.swagger = 'genSwagger' in options
    data.entitySerialVersionUID = true
    data.restControllerStyle = 'genRestController' in options
    data.superMapperClassPackage = 'com.baomidou.mybatisplus.core.mapper.BaseMapper'
    data.superServiceClassPackage = 'com.baomidou.mybatisplus.extension.service.IService'
    data.superServiceImplClassPackage = 'com.baomidou.mybatisplus.extension.service.impl.ServiceImpl'
    data.author = options.author
    data.superServiceClass = 'IService'
    data.superServiceImplClass = 'ServiceImpl'
    data.superMapperClass = 'BaseMapper'
    data.entityLombokModel = 'genLombok' in options
    data.camelTableName = entityName.charAt(0).toLowerCase() + entityName.slice(1)
    data.package = pkg
    data.table = table
    data.entity = entityName

    return data
}

function field2Camel(field) {
	return field.replace(/_([a-z])/g, (match, p) => p.toUpperCase())
}

function getRenderEntityData(data, fields) {
    const importMapping = {
        'datetime': 'java.time.LocalDateTime',
        'date': 'java.time.LocalDate'
    }
    const typeMapping = {
        'datetime': 'LocalDateTime',
        'date': 'LocalDate',
        'bit(1)': 'Boolean',
        'bigint': 'Long',
        'int': 'Integer',
        'tinyint': 'Integer'
    }
    var importPackages = []
    var fds = []

    for (let field of fields) {
        var fld = {}
        fld.name = field.fieldName
        fld.propertyName = field2Camel(field.fieldName)
        fld.keyFlag = field.key === 'PRI'
        if (field.fieldType in importMapping) importPackages.push(importMapping[field.fieldType])
        fld.propertyType = typeMapping[field.fieldType]
        fld.comment = field.fieldComment
        fds.push(fld)
    }

    importPackages.push('java.io.Serializable')
    importPackages.push('com.baomidou.mybatisplus.annotation.TableName')
    importPackages.push('com.baomidou.mybatisplus.annotation.TableId')
    importPackages.push('com.baomidou.mybatisplus.annotation.IdType')
    importPackages.push('com.baomidou.mybatisplus.annotation.TableField')

    importPackages = Array.from(new Set(importPackages))
    data.table.fields = fds
    data.table.importPackages = importPackages

    return data
}

module.exports = {
    getRenderData,
    getRenderEntityData
}