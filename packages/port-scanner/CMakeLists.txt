cmake_minimum_required( VERSION 3.2 )

# Name of the project (will be the name of the plugin)
project( scanner )

set( CMAKE_CXX_STANDARD 11 )

# Essential include files to build a node addon,
# you should add this line in every CMake.js based project.
include_directories( ${CMAKE_JS_INC} )

# Declare the source files location
file( GLOB SOURCE_FILES "src/*.cpp" "src/*.h" )

# This line will tell CMake that we're building a shared library
# from the above source files
# named after the project's name
add_library( ${PROJECT_NAME} SHARED ${SOURCE_FILES} )

# This line will give our library file a .node extension
# without any "lib" prefix
set_target_properties( ${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node" )

set( SFML_PATH "${CMAKE_SOURCE_DIR}/deps/SFML" )
message( STATUS SFML_PATH: "${SFML_PATH}" )
include_directories( ${SFML_PATH}/include )
file( GLOB LIBRARIES "${SFML_PATH}/build/Release/*.dylib" )
message( "LIBRARIES = ${LIBRARIES}" )

#add_library( ${PROJECT_NAME}_SFML SHARED "src/init/init-sfml.cpp" )
#set_target_properties( ${PROJECT_NAME}_SFML PROPERTIES COMPILE_FLAGS -DCPU )
#set_target_properties( ${PROJECT_NAME}_SFML PROPERTIES PREFIX "" SUFFIX ".node" )
#target_link_libraries( ${PROJECT_NAME}_SFML "${CMAKE_JS_LIB};${SFML_LIB};${PROJECT_NAME}" )
#target_link_libraries( ${PROJECT_NAME} "${CMAKE_JS_LIB};${SFML_LIB}" )

# Essential library files to link to a node addon,
# you should add this line in every CMake.js based project.
target_link_libraries( ${PROJECT_NAME} ${CMAKE_JS_LIB};${LIBRARIES} )

execute_process(
		COMMAND node -p "require('node-addon-api').include"
		WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
		OUTPUT_VARIABLE NODE_ADDON_API_DIR
)
string( REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR} )
string( REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR} )
target_include_directories( ${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR} )
