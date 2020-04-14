#include <napi.h>
#include <iostream>
#include <string>

#include <SFML/Network.hpp>

Napi::String ping( const Napi::CallbackInfo &info );

Napi::Boolean portState( const Napi::CallbackInfo &info );
