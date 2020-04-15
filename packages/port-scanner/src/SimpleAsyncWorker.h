#pragma once

#include <napi.h>

#ifndef SCANNER_SIMPLEASYNCWORKER_H
#define SCANNER_SIMPLEASYNCWORKER_H


class SimpleAsyncWorker : public Napi::AsyncWorker {
public:
	SimpleAsyncWorker( Napi::Function &callback, int runTime );
	
	virtual ~SimpleAsyncWorker() {
	};
	
	void Execute();
	
	void OnOK();

private:
	int runTime;
};


#endif //SCANNER_SIMPLEASYNCWORKER_H
