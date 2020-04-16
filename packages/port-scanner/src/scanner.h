#include <napi.h>
#include <iostream>
#include <string>

#include "ScanAsyncWorker.h"

Napi::String ping( const Napi::CallbackInfo &info );

Napi::Value scan( const Napi::CallbackInfo &info );
